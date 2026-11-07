<?php

declare(strict_types=1);

namespace Plugins\Catalog;

use Kestello\Cms\Api\Schema;
use Kestello\Cms\Blocks\BlockContext;
use Kestello\Cms\Blocks\BlockDefinition;
use Kestello\Cms\Cache\PageTags;
use Kestello\Cms\Cms;
use Kestello\Cms\Content\Entries;
use Kestello\Cms\Content\Entry;
use Kestello\Cms\Content\Field;
use Kestello\Cms\Content\Terms;
use Kestello\Cms\Extension\PluginProvider;
use Kestello\Contracts\Cache\PageCache;
use Kestello\Framework\Core\Container;
use Kestello\Framework\Database\QueryBuilder;
use Kestello\Framework\Events\EventDispatcher;
use Plugins\Catalog\Events\StockChanged;
use Plugins\Catalog\Events\StockLow;

/**
 * A product catalog that touches nothing in core. Everything below goes
 * through the same registries a site's own plugins use; reading this file
 * top to bottom is a tour of Kestello's extension points.
 */
final class CatalogProvider extends PluginProvider
{
    public function register(Container $container): void
    {
        $container->singleton(Stock::class, fn(Container $c) => new Stock($c->make(EventDispatcher::class)));
        $container->singleton(Products::class, fn(Container $c) => new Products($c->make(Cms::class)));
    }

    public function boot(Cms $cms): void
    {
        $this->content($cms);
        $this->permissions($cms);
        $this->api($cms);
        $this->admin($cms);
        $this->site($cms);
        $this->background($cms);
    }

    /** Content types and a taxonomy: named after the plugin, edited on the core screens. */
    private function content(Cms $cms): void
    {
        $cms->content->type(Stock::PRODUCT)
            ->label('Product', 'Products')->icon('package')->path('/products')->archive()->excerpt()->menuOrder(30)
            ->description('Things you sell. Stock is kept on Catalog → Stock.')
            ->fields([
                Field::text('sku')->label('SKU')->required()->max(40)->indexed()->sidebar()->help('Your own product code. Shown on the stock screen and in low-stock emails.'),
                Field::number('price')->label('Price')->required()->min(0)->option('step', 0.01)->indexed()->sidebar()->help('In the currency chosen under Settings → Catalog.'),
                Field::entry('brand', [Products::BRAND])->label('Brand')->indexed()->sidebar(),
                Field::image('gallery', multiple: true)->label('Images')->help('The first image is the one product lists show.'),
                Field::richText('body')->label('Description'),
            ]);

        $cms->content->type(Products::BRAND)
            ->label('Brand', 'Brands')->icon('storefront')->path('/brands')->menuOrder(31)
            ->description('Makers of your products. Each brand page can list its products.')
            ->fields([
                Field::image('logo')->label('Logo')->sidebar(),
                Field::url('website')->label('Website')->sidebar(),
                Field::richText('body')->label('About the brand'),
            ]);

        $cms->content->taxonomy(Products::CATEGORY)
            ->label('Product category', 'Product categories')->hierarchical()->for(Stock::PRODUCT)->path('/shop')->menuOrder(30)
            ->description('Sections of the catalog. Categories can nest.');
    }

    private function permissions(Cms $cms): void
    {
        $cms->auth->roles->capability('catalog.manage', 'Record stock and change low-stock levels', grantTo: ['admin', 'editor']);
        $cms->auth->roles->capability('catalog.view_stock', 'See stock levels', grantTo: ['admin', 'editor', 'author']);
    }

    private function api(Cms $cms): void
    {
        $cms->api->scope('catalog:read', 'Read stock levels');
        $cms->api->scope('catalog:write', 'Record stock');
        $cms->api->endpoint(Api\ListProducts::class);
        $cms->api->endpoint(Api\ListStock::class);
        $cms->api->endpoint(Api\ProductStock::class);
        $cms->api->endpoint(Api\RecordMovement::class);
        $cms->api->endpoint(Api\UpdateLowAt::class);

        // A field on the core entries resource; the products list shows it as a column.
        $stock = static fn() => $cms->container->make(Stock::class);
        $cms->api->extend('entries')->field('catalog_stock', static function (array $row) use ($stock): ?array {
            $entry = $row['model'] ?? null;

            return $entry instanceof Entry && $entry->type === Stock::PRODUCT ? $stock()->level((int) $entry->getKey()) : null;
        }, read: 'catalog.view_stock');
    }

    private function admin(Cms $cms): void
    {
        $cms->admin->page('stock', '@catalog/admin/Stock', 'Stock', 'catalog.view_stock', ['label' => 'Stock', 'icon' => 'package', 'group' => 'content', 'order' => 35]);
        $cms->admin->widget('dashboard', '@catalog/admin/LowStockWidget', title: 'Running low', size: 'half', capability: 'catalog.view_stock');
        $cms->admin->column(
            'entries.list',
            'catalog_stock',
            label: 'Stock',
            component: '@catalog/admin/StockCell',
            capability: 'catalog.view_stock',
            align: 'end',
            when: ['type' => Stock::PRODUCT],
        );
        $cms->admin->settings(
            'general',
            'Catalog',
            Schema::object([
                'currency' => Schema::string()->pattern('[A-Z]{3}')->default('EUR')->description('Three-letter code, such as EUR, USD or GBP.'),
                'low_stock' => Schema::int()->min(0)->max(Stock::MAX_QUANTITY)->default(5)->description('A product is low when its stock is at or below this, unless it has a level of its own.'),
            ]),
            labels: ['currency' => 'Currency', 'low_stock' => 'Low-stock level'],
            description: 'Prices and the daily low-stock notice.',
            capability: 'catalog.manage',
        );
    }

    /**
     * On the site: data for block bindings, and the product grid block. The
     * product template and a pattern are JSON files in templates/ and patterns/.
     */
    private function site(Cms $cms): void
    {
        // {"bind": "catalog.price"} in any text or heading block, in templates and inside entry lists.
        $cms->blocks->bindings->source('catalog', [
            'catalog.price' => 'Price', 'catalog.sku' => 'SKU', 'catalog.availability' => 'In stock or sold out', 'catalog.brand' => 'Brand',
        ], static function (string $path, BlockContext $ctx): ?string {
            $entry = $ctx->entry;
            if (!$entry instanceof Entry || $entry->type !== Stock::PRODUCT) {
                return null;
            }
            PageTags::add('catalog:stock');

            return match ($path) {
                'catalog.price' => is_numeric($entry->field('price')) ? Products::formatPrice((float) $entry->field('price')) : null,
                'catalog.sku' => (string) $entry->field('sku', '') ?: null,
                'catalog.availability' => QueryBuilder::table('p_catalog_stock')->where('entry_id', $entry->getKey())->where('quantity', '>', 0)->exists() ? 'In stock' : 'Sold out',
                'catalog.brand' => is_numeric($entry->field('brand'))
                    ? (Entry::query()->ofType(Products::BRAND)->published()->where('id', (int) $entry->field('brand'))->first()?->title ?: null) : null,
                default => null,
            };
        });

        $cms->blocks->register(BlockDefinition::make('catalog/product-grid')
            ->label('Product grid')->category('data')->icon('grid-four')
            ->description('Products as cards with image, name and price. Filter by category, sort, and leave out sold-out items.')
            ->fields(static function (): array {
                $categories = ['' => 'All categories'];
                foreach (QueryBuilder::table('terms')->where('taxonomy', Products::CATEGORY)->orderBy('name')->limit(200)->get() as $t) {
                    $categories[(string) $t['slug']] = (string) $t['name'];
                }

                return [
                    Field::select('category', $categories)->label('Category')->default(''),
                    Field::select('sort', Products::SORTS)->label('Order')->default('newest'),
                    Field::number('limit')->label('How many')->option('integer', true)->min(1)->max(24)->default(8)->option('bindable', false),
                    Field::boolean('in_stock')->label('Leave out sold-out products'),
                    Field::boolean('price')->label('Show prices')->default(true),
                    Field::text('empty')->label('When there is nothing to show')->max(200)->option('bindable', false),
                    Field::select('width', ['content' => 'Text width', 'wide' => 'Wide', 'full' => 'Full width'])->label('Width')->default('wide'),
                ];
            })
            ->example(['limit' => 4, 'price' => true])
            ->prepare(static function (array $node, BlockContext $ctx) use ($cms): array {
                $p = (array) $node['props'];
                $node['props'] = $p + ['items' => [], 'currency' => Stock::currency()];
                if (!$ctx->takeQuery()) {
                    return $node;       // a page runs a limited number of lists
                }
                PageTags::add('list:' . Stock::PRODUCT, 'catalog:stock');
                $products = $cms->container->make(Products::class);
                $entries = $products->query([
                    'category' => ($p['category'] ?? '') !== '' ? (string) $p['category'] : null,
                    'in_stock' => !empty($p['in_stock']) ? true : null,
                    'sort' => (string) ($p['sort'] ?? 'newest'),
                ])->limit(max(1, min(24, (int) ($p['limit'] ?? 8))))->get()->all();
                $node['props']['items'] = $products->present($entries);

                return $node;
            }));
    }

    private function background(Cms $cms): void
    {
        $cms->hooks->event(Events\StockChanged::class, since: '1.0.0', group: 'Stock');
        $cms->hooks->event(Events\StockLow::class, since: '1.0.0', group: 'Stock');
        $cms->queue->job(CheckLowStock::class);
        $cms->schedule->job(new CheckLowStock())->dailyAt('07:00')->description('Emails the people who manage the catalog when products are running low.');
        $cms->notifications->type(LowStockNotification::class, 'Products running low', 'A daily list of products at or below their low-stock level.');

        // Other services (a supplier's system, a chat channel) can hear about it through a webhook.
        $cms->webhooks->event('catalog.stock-low', 'A product is running low', 'Catalog', 'data: product id, title, quantity and its low-stock level.');
        $cms->events->on(StockLow::class, static function (StockLow $e) use ($cms): void {
            $cms->webhooks->dispatch('catalog.stock-low', [
                'product' => ['id' => $e->productId, 'title' => (string) (\Kestello\Cms\Content\Entry::query()->find($e->productId)->title ?? '')],
                'quantity' => $e->quantity,
                'low_at' => $e->lowAt,
            ]);
        });

        // Cached pages that show "in stock" go stale when stock changes.
        $cms->events->on(StockChanged::class, static function () use ($cms): void {
            try {
                $cms->container->make(PageCache::class)->purge('catalog:stock');
            } catch (\Throwable) {
                // no page cache configured
            }
        });
    }

    /** Uninstalling removes the products, brands and categories; the migrations drop the stock tables. */
    public function uninstall(Cms $cms): void
    {
        $entries = $cms->container->make(Entries::class);
        $entries->purgeType(Stock::PRODUCT);
        $entries->purgeType(Products::BRAND);
        $cms->container->make(Terms::class)->purgeTaxonomy(Products::CATEGORY);
    }
}
