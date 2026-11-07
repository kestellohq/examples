<?php

declare(strict_types=1);

namespace Plugins\Catalog;

use Kestello\Cms\Cms;
use Kestello\Cms\Content\Entry;
use Kestello\Cms\Media\MediaPresenter;
use Kestello\Framework\Database\Orm\ModelQuery;
use Kestello\Framework\Database\QueryBuilder;

/**
 * Published products as visitors see them: the public API and the product
 * grid block both use this, so a headless shop and the site show the same
 * thing. Exact stock counts stay private; visitors only learn "in stock".
 */
final class Products
{
    public const string BRAND = 'catalog-brand';
    public const string CATEGORY = 'catalog-category';
    public const array SORTS = ['newest' => 'Newest first', 'price' => 'Price, low to high', '-price' => 'Price, high to low', 'title' => 'By name'];

    public function __construct(private readonly Cms $cms) {}

    /** "€12.50" where PHP has intl, else "12.50 EUR". */
    public static function formatPrice(float $amount, ?string $currency = null): string
    {
        $currency ??= Stock::currency();
        if (class_exists(\NumberFormatter::class)) {
            $formatted = (new \NumberFormatter('en', \NumberFormatter::CURRENCY))->formatCurrency($amount, $currency);
            if ($formatted !== false) {
                return $formatted;
            }
        }

        return number_format($amount, 2, '.', ',') . ' ' . $currency;
    }

    /**
     * @param array{category?: ?string, brand?: ?int, min_price?: int|float|null, max_price?: int|float|null, in_stock?: ?bool, sort?: string} $filters
     * @return ModelQuery<Entry>
     */
    public function query(array $filters = []): ModelQuery
    {
        $q = Entry::query()->ofType(Stock::PRODUCT)->published();
        if (($category = $filters['category'] ?? null) !== null && $category !== '') {
            $q->whereExists(static fn(QueryBuilder $s) => $s->from('entry_term')->join('terms', 'terms.id', '=', 'entry_term.term_id')
                ->whereColumn('entry_term.entry_id', '=', 'entries.id')->where('terms.taxonomy', self::CATEGORY)->where('terms.slug', $category));
        }
        if (($brand = $filters['brand'] ?? null) !== null) {
            $q->whereExists(static fn(QueryBuilder $s) => $s->from('entry_index')->whereColumn('entry_index.entry_id', '=', 'entries.id')
                ->where('entry_index.field', 'brand')->where('entry_index.value_number', $brand));
        }
        foreach (['min_price' => '>=', 'max_price' => '<='] as $key => $op) {
            if (($price = $filters[$key] ?? null) !== null) {
                $q->whereExists(static fn(QueryBuilder $s) => $s->from('entry_index')->whereColumn('entry_index.entry_id', '=', 'entries.id')
                    ->where('entry_index.field', 'price')->where('entry_index.value_number', $op, $price));
            }
        }
        if (($filters['in_stock'] ?? null) === true) {
            $q->whereExists(static fn(QueryBuilder $s) => $s->from('p_catalog_stock')->whereColumn('p_catalog_stock.entry_id', '=', 'entries.id')->where('p_catalog_stock.quantity', '>', 0));
        }
        match ($filters['sort'] ?? 'newest') {
            'price', '-price' => $q->select('entries.*')
                ->leftJoin('entry_index', static fn(QueryBuilder $j) => $j->whereColumn('entry_index.entry_id', '=', 'entries.id')->where('entry_index.field', 'price'))
                ->orderBy('entry_index.value_number', ($filters['sort'] ?? '') === '-price' ? 'DESC' : 'ASC')->orderBy('entries.id'),
            'title' => $q->orderBy('entries.title')->orderBy('entries.id'),
            default => $q->orderByDesc('entries.published_at')->orderByDesc('entries.id'),
        };

        return $q;
    }

    /**
     * @param list<Entry> $entries
     * @return list<array<string, mixed>>
     */
    public function present(array $entries): array
    {
        if ($entries === []) {
            return [];
        }
        $type = $this->cms->content->get(Stock::PRODUCT);
        $brandType = $this->cms->content->get(self::BRAND);
        $ids = array_map(static fn(Entry $e) => (int) $e->getKey(), $entries);

        $imageIds = $brandIds = [];
        foreach ($entries as $e) {
            $gallery = (array) $e->field('gallery', []);
            if (isset($gallery[0]) && is_numeric($gallery[0])) {
                $imageIds[] = (int) $gallery[0];
            }
            if (is_numeric($e->field('brand'))) {
                $brandIds[] = (int) $e->field('brand');
            }
        }
        $images = MediaPresenter::many($imageIds);
        $brands = [];
        foreach ($brandIds === [] ? [] : Entry::query()->ofType(self::BRAND)->published()->whereIn('id', array_values(array_unique($brandIds)))->get()->all() as $b) {
            $brands[(int) $b->getKey()] = ['id' => (int) $b->getKey(), 'title' => (string) $b->title, 'url' => $b->path($brandType)];
        }
        $inStock = array_flip(array_map('intval', QueryBuilder::table('p_catalog_stock')->whereIn('entry_id', $ids)->where('quantity', '>', 0)->pluck('entry_id')));
        $currency = Stock::currency();

        return array_map(static function (Entry $e) use ($type, $images, $brands, $inStock, $currency): array {
            $gallery = (array) $e->field('gallery', []);
            $price = $e->field('price');

            return [
                'id' => (int) $e->getKey(),
                'title' => (string) $e->title,
                'url' => $e->path($type),
                'sku' => (string) $e->field('sku', ''),
                'price' => is_numeric($price) ? round((float) $price, 2) : null,
                'price_label' => is_numeric($price) ? self::formatPrice((float) $price, $currency) : null,
                'currency' => $currency,
                'image' => isset($gallery[0]) && is_numeric($gallery[0]) ? ($images[(int) $gallery[0]] ?? null) : null,
                'brand' => is_numeric($e->field('brand')) ? ($brands[(int) $e->field('brand')] ?? null) : null,
                'in_stock' => isset($inStock[(int) $e->getKey()]),
            ];
        }, $entries);
    }
}
