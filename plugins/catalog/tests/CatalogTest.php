<?php

declare(strict_types=1);

namespace Plugins\Catalog\Tests;

use Kestello\Cms\Backup\DatabaseDump;
use Kestello\Cms\Blocks\BlockContext;
use Kestello\Cms\Blocks\BlocksModule;
use Kestello\Cms\Content\ContentModule;
use Kestello\Cms\Content\Entry;
use Kestello\Cms\Design\DesignModule;
use Kestello\Cms\Design\ThemeTemplates;
use Kestello\Cms\Extension\ArrayStateStore;
use Kestello\Cms\Extension\ExtensionManager;
use Kestello\Cms\Extension\SuspensionList;
use Kestello\Cms\Media\MediaModule;
use Kestello\Cms\Notifications\NotificationsModule;
use Kestello\Cms\Package\PackageBuilder;
use Kestello\Cms\Package\PackageInstaller;
use Kestello\Framework\Database\Connection;
use Kestello\Framework\Database\DatabaseManager;
use Kestello\Framework\Database\MigrationRunner;
use Kestello\Framework\Database\Model;
use Kestello\Framework\Database\QueryBuilder;
use Kestello\Framework\Settings\Settings;
use Kestello\Tests\Auth\AuthTestCase;

/**
 * The plugin's whole life: it installs from a zip, activates, works,
 * deactivates and uninstalls cleanly, on SQLite and on every database in
 * KESTELLO_TEST_DATABASES.
 *
 * Run with: sh tools/check.sh plugins/catalog
 */
final class CatalogTest extends AuthTestCase
{
    private string $root;
    private ArrayStateStore $state;
    private ExtensionManager $extensions;
    /** @var list<object> */
    private array $events = [];

    protected function tearDown(): void
    {
        Model::resetRegistry();
        parent::tearDown();
    }

    public function testTheWholeLifecycleOnSqlite(): void
    {
        $this->lifecycle();
    }

    public function testTheWholeLifecycleOnMysqlAndPostgres(): void
    {
        $extra = json_decode((string) getenv('KESTELLO_TEST_DATABASES'), true);
        if (!is_array($extra) || $extra === []) {
            $this->assertTrue(true);
            return;      // only when KESTELLO_TEST_DATABASES is set
        }
        foreach ($extra as $config) {
            $this->db = new Connection($config);
            DatabaseManager::setConnection($this->db);
            Settings::destroy();
            (new DatabaseDump($this->db))->dropAll();
            (new MigrationRunner(self::corePath('database/migrations')))->migrate();
            $this->lifecycle();
            (new DatabaseDump($this->db))->dropAll();
        }
    }

    private function lifecycle(): void
    {
        $this->events = [];
        $this->root = $this->cms->paths->root();
        $this->state = new ArrayStateStore();

        // ── install from a zip and activate ─────────────────────────────
        $zip = PackageBuilder::build(dirname(__DIR__), $this->root . '/dist')['zip'];
        $this->request();
        $installed = (new PackageInstaller($this->cms))->install($zip, ['allow_unsigned' => true]);
        $this->assertSame('catalog', $installed['package']->slug());
        $this->extensions->activatePlugin('catalog');
        $schema = $this->db->schema();
        $this->assertTrue($schema->hasTable('p_catalog_stock') && $schema->hasTable('p_catalog_stock_movements'), 'migrations ran');

        // ── the next request: the plugin boots with the site ────────────
        $this->request();
        $this->createUser();
        $this->createUser(['username' => 'aria', 'email' => 'aria@example.test', 'role' => 'author']);
        $this->createUser(['username' => 'cleo', 'email' => 'cleo@example.test', 'role' => 'contributor']);
        $this->signIn('ana');

        $types = array_column($this->json($this->api('GET', '/content/types'))['data'], null, 'name');
        $this->assertSame('plugin:catalog', $types['catalog-product']['owner']);
        $this->assertArrayHasKey('catalog-brand', $types);
        $this->assertSame(['plugin:catalog', 'Stock'], [$this->cms->hooks->get('event', \Plugins\Catalog\Events\StockLow::class)?->owner, $this->cms->hooks->get('event', \Plugins\Catalog\Events\StockLow::class)?->group], 'its events are in the hook reference');
        $this->assertSame('plugin:catalog', $this->cms->webhooks->events()['catalog.stock-low']['owner'] ?? null, 'and webhooks can subscribe to running low');

        $brand = $this->create('catalog-brand', ['title' => 'Enamelworks', 'status' => 'published']);
        $r = $this->api('POST', '/taxonomies/catalog-category/terms', ['name' => 'Kitchen']);
        $this->assertSame(200, $r->statusCode(), $r->content());
        $term = $this->json($r)['data'];
        $mug = $this->create('catalog-product', ['title' => 'Enamel mug', 'status' => 'published', 'terms' => ['catalog-category' => [$term['id']]],
            'data' => ['sku' => 'MUG-1', 'price' => 12.5, 'brand' => $brand['id']]]);
        $plate = $this->create('catalog-product', ['title' => 'Enamel plate', 'status' => 'published', 'data' => ['sku' => 'PLT-1', 'price' => 24]]);
        $this->assertSame(422, $this->api('POST', '/content/catalog-product/entries', ['title' => 'No SKU', 'status' => 'published', 'data' => ['price' => 1]])->statusCode(), 'required fields are checked by core on publish');
        $priced = fn(string $q) => array_column($this->json($this->api('GET', '/content/catalog-product/entries?sort=field:price&' . $q))['data'], 'title');
        $this->assertSame(['Enamel mug'], $priced('filter[price][lt]=20'), 'range filters on an indexed number, on every database');
        $this->assertSame(['Enamel mug', 'Enamel plate'], $priced('filter[price][gte]=12.5&filter[price][lte]=24'));
        $this->assertSame(['Enamel plate'], $priced('filter[brand][exists]=false'));
        $this->assertSame(['Enamel mug'], $priced("filter[brand]={$brand['id']}"));

        // ── stock: movements, guard rails, events, audit ─────────────────
        $move = fn(int $id, string $reason, int $amount) => $this->api('POST', "/catalog/products/{$id}/movements", ['reason' => $reason, 'amount' => $amount]);
        $this->assertSame(10, $this->json($move($mug['id'], 'received', 10))['data']['quantity']);
        $this->assertSame(7, $this->json($move($mug['id'], 'sold', -3))['data']['quantity']);
        $tooMany = $move($mug['id'], 'sold', -20);
        $this->assertSame(422, $tooMany->statusCode());
        $this->assertStringContainsString('Only 7 in stock.', $tooMany->content());
        $this->assertSame(422, $move($mug['id'], 'received', -1)->statusCode(), 'received stock is positive');
        $this->assertSame(404, $move($brand['id'], 'received', 1)->statusCode(), 'only products have stock');
        $counted = $this->json($move($mug['id'], 'counted', 2))['data'];
        $this->assertSame([2, -5, true], [$counted['quantity'], $counted['change'], $counted['low']]);
        $this->assertSame(['StockChanged', 'StockChanged', 'StockChanged', 'StockLow'], array_map(static fn(object $e) => (new \ReflectionClass($e))->getShortName(), $this->events));
        $this->assertContains('catalog.stock_changed', $this->auditEvents());

        $this->assertSame(200, $this->api('PUT', "/catalog/products/{$plate['id']}/low-at", ['low_at' => 0])->statusCode());
        $low = $this->json($this->api('GET', '/catalog/stock?low=1'));
        $this->assertSame([$plate['id'], $mug['id']], array_column($low['data'], 'id'), 'lowest first; the plate is at its own level 0');
        $history = $this->json($this->api('GET', "/catalog/products/{$mug['id']}/stock"))['data'];
        $this->assertSame(['counted', 'sold', 'received'], array_column($history['movements'], 'reason'));
        $this->assertSame('ana', $history['movements'][0]['user']);

        // ── the column on the products list, for those who may see stock ─
        $rows = array_column($this->json($this->api('GET', '/content/catalog-product/entries'))['data'], null, 'id');
        $this->assertSame(2, $rows[$mug['id']]['catalog_stock']['quantity']);
        $posts = $this->json($this->api('GET', '/content/post/entries'))['data'];
        $this->assertSame([], array_filter(array_column($posts, 'catalog_stock')), 'only products carry stock');
        $this->signIn('aria');
        $this->assertSame(403, $move($mug['id'], 'received', 1)->statusCode(), 'authors see stock but do not change it');
        $this->assertSame(200, $this->api('GET', '/catalog/stock')->statusCode());
        $this->signIn('cleo');
        $this->assertSame(403, $this->api('GET', '/catalog/stock')->statusCode());
        $rows = $this->json($this->api('GET', '/content/catalog-product/entries'))['data'];
        $this->assertArrayNotHasKey('catalog_stock', $rows[0] ?? [], 'contributors list products without stock');

        // ── the public API: published products, no exact counts ─────────
        $this->assertSame(204, $this->api('DELETE', '/auth/session')->statusCode());
        $public = $this->json($this->api('GET', '/catalog/products?sort=price'));
        $this->assertSame(['Enamel mug', 'Enamel plate'], array_column($public['data'], 'title'));
        $first = $public['data'][0];
        $this->assertSame([12.5, 'MUG-1', true, 'Enamelworks', '/products/enamel-mug'], [$first['price'], $first['sku'], $first['in_stock'], $first['brand']['title'], $first['url']]);
        $this->assertArrayNotHasKey('quantity', $first);
        $this->assertSame(['Enamel plate'], array_column($this->json($this->api('GET', '/catalog/products?min_price=20'))['data'], 'title'));
        $this->assertSame(['Enamel mug'], array_column($this->json($this->api('GET', '/catalog/products?category=kitchen'))['data'], 'title'));
        $this->assertSame(['Enamel mug'], array_column($this->json($this->api('GET', '/catalog/products?in_stock=1'))['data'], 'title'));
        $this->assertSame(401, $this->api('GET', '/catalog/stock')->statusCode());
        $paths = array_keys($this->json($this->api('GET', '/openapi.json'))['paths']);
        $this->assertContains('/catalog/products', $paths);
        $this->assertNotContains('/catalog/stock', $paths, 'guests only see what they can call');

        // ── on the site: the block, bindings, template and pattern ──────
        $tree = [['type' => 'catalog/product-grid', 'id' => 'g1', 'props' => ['in_stock' => true, 'limit' => 4], 'children' => []]];
        $grid = $this->cms->blocks->prepare($tree, new BlockContext());
        $this->assertSame(['Enamel mug'], array_column(((array) $grid[0]['props'])['items'], 'title'));
        $entry = Entry::query()->find($mug['id']);
        $ctx = (new BlockContext())->withEntry($entry, $this->cms->content->get('catalog-product'));
        $this->assertSame(['Enamelworks', 'In stock'], [$this->cms->blocks->bindings->resolve('catalog.brand', $ctx), $this->cms->blocks->bindings->resolve('catalog.availability', $ctx)]);
        $this->assertStringContainsString('12.50', (string) $this->cms->blocks->bindings->resolve('catalog.price', $ctx));
        $templates = $this->cms->container->make(ThemeTemplates::class);
        $this->assertCount(4, $templates->files('template')['entry-catalog-product']['blocks'] ?? [], 'the template ships with the plugin and every block is valid');
        $this->assertCount(1, $templates->files('pattern')['catalog-featured-products']['blocks'] ?? []);

        // ── background: the daily notice ────────────────────────────────
        $this->assertNotNull($this->cms->schedule->get('catalog.check-low-stock'));
        $result = (new \Plugins\Catalog\CheckLowStock())->handle($this->cms->container->make(\Plugins\Catalog\Stock::class), $this->cms);
        $this->assertSame('2 low, told 1.', $result);
        $this->assertSame(1, QueryBuilder::table('notifications')->where('type', 'catalog.low-stock')->count(), 'ana, the only one who manages the catalog');
        $this->assertSame('2 products are running low', $this->mail[0]['subject'] ?? null);

        // ── deactivate: the plugin is gone, its data stays ─────────────
        $this->extensions->deactivatePlugin('catalog');
        $this->request();
        $this->signIn('ana');
        $this->assertArrayNotHasKey('catalog-product', array_column($this->json($this->api('GET', '/content/types'))['data'], null, 'name'));
        $this->assertSame(404, $this->api('GET', '/catalog/stock')->statusCode());
        $this->assertSame(2, QueryBuilder::table('entries')->where('type', 'catalog-product')->count(), 'products wait for the plugin to come back');

        // ── uninstall: nothing of it is left ────────────────────────────
        Settings::getInstance()->set('plugin.catalog.general.currency', 'GBP');
        $this->extensions->uninstallPlugin('catalog');
        $schema = $this->db->schema();
        $this->assertFalse($schema->hasTable('p_catalog_stock') || $schema->hasTable('p_catalog_stock_movements'));
        $this->assertSame(0, QueryBuilder::table('entries')->whereIn('type', ['catalog-product', 'catalog-brand'])->count());
        $this->assertSame(0, QueryBuilder::table('terms')->where('taxonomy', 'catalog-category')->count());
        $this->assertSame(0, QueryBuilder::table('settings')->where('key', 'LIKE', 'plugin.catalog.%')->count());
        $this->assertFalse(is_dir($this->root . '/content/plugins/catalog'));
    }

    /** A fresh request on the same site: core modules, then the active plugins. */
    private function request(): void
    {
        Model::resetRegistry();
        $this->bootCms($this->root ?? null);
        $this->extensions = new ExtensionManager($this->cms, $this->state, new SuspensionList($this->root . '/suspended.json'), '0.1.0');
        $this->cms->setExtensions($this->extensions);
        $modules = [new ContentModule(), new MediaModule(), new BlocksModule(), new DesignModule(), new NotificationsModule()];
        foreach ($modules as $module) {      // the kernel's order: core modules, then plugins
            $module->register($this->cms->container);
            $module->boot($this->cms);
        }
        $this->extensions->boot();
        $this->assertSame([], $this->extensions->suspensions()->all(), 'the plugin booted');
        ContentModule::finalize($this->cms);
        $this->cms->events->on(\Plugins\Catalog\Events\StockChanged::class, fn(object $e) => $this->events[] = $e);
        $this->cms->events->on(\Plugins\Catalog\Events\StockLow::class, fn(object $e) => $this->events[] = $e);
    }

    private function signIn(string $login): void
    {
        $this->assertSame(200, $this->api('POST', '/auth/session', ['login' => $login, 'password' => self::PASSWORD])->statusCode());
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    private function create(string $type, array $body): array
    {
        $r = $this->api('POST', "/content/{$type}/entries", $body);
        $this->assertSame(200, $r->statusCode(), $r->content());

        return $this->json($r)['data'];
    }
}
