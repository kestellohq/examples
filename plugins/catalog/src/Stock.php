<?php

declare(strict_types=1);

namespace Plugins\Catalog;

use InvalidArgumentException;
use Kestello\Framework\Database\DatabaseManager;
use Kestello\Framework\Database\QueryBuilder;
use Kestello\Framework\Events\EventDispatcher;
use Kestello\Framework\Settings\Settings;
use Plugins\Catalog\Events\StockChanged;
use Plugins\Catalog\Events\StockLow;

/**
 * Stock levels and their history (p_catalog_stock, p_catalog_stock_movements).
 * A product without a row has never been counted and holds 0.
 */
final class Stock
{
    public const string PRODUCT = 'catalog-product';
    public const array REASONS = ['received' => 'Received', 'sold' => 'Sold', 'returned' => 'Returned', 'counted' => 'Stock count', 'damaged' => 'Damaged or lost'];
    public const int MAX_QUANTITY = 1_000_000;

    public function __construct(private readonly ?EventDispatcher $events = null) {}

    /** The site-wide low-stock level (Settings → Catalog). */
    public static function defaultLowAt(): int
    {
        return max(0, (int) Settings::getInstance()->get('plugin.catalog.general.low_stock', 5));
    }

    public static function currency(): string
    {
        return (string) Settings::getInstance()->get('plugin.catalog.general.currency', 'EUR');
    }

    /** @return array{quantity: int, low_at: int, custom_low_at: ?int, low: bool} */
    public function level(int $productId): array
    {
        return $this->levels([$productId])[$productId];
    }

    /**
     * @param list<int> $productIds
     * @return array<int, array{quantity: int, low_at: int, custom_low_at: ?int, low: bool}>
     */
    public function levels(array $productIds): array
    {
        $default = self::defaultLowAt();
        $rows = $productIds === [] ? [] : QueryBuilder::table('p_catalog_stock')->whereIn('entry_id', $productIds)->get();
        $by = [];
        foreach ($rows as $r) {
            $by[(int) $r['entry_id']] = $r;
        }
        $out = [];
        foreach ($productIds as $id) {
            $quantity = (int) ($by[$id]['quantity'] ?? 0);
            $custom = isset($by[$id]['low_at']) ? (int) $by[$id]['low_at'] : null;
            $lowAt = $custom ?? $default;
            $out[$id] = ['quantity' => $quantity, 'low_at' => $lowAt, 'custom_low_at' => $custom, 'low' => $quantity <= $lowAt];
        }

        return $out;
    }

    /**
     * Record a change ("received 12", "sold -1") or, with reason "counted",
     * set the quantity found in a stock count (the change is worked out).
     * The quantity never goes below zero.
     *
     * @return array{id: int, change: int, quantity: int}
     */
    public function record(int $productId, int $amount, string $reason, ?string $note = null, ?int $userId = null): array
    {
        if (!isset(self::REASONS[$reason])) {
            throw new InvalidArgumentException('Unknown reason.');
        }
        $this->assertProduct($productId);

        $result = DatabaseManager::getConnection()->transaction(function () use ($productId, $amount, $reason, $note, $userId): array {
            $row = QueryBuilder::table('p_catalog_stock')->where('entry_id', $productId)->lockForUpdate()->first();
            if ($row === null) {
                QueryBuilder::table('p_catalog_stock')->insert(['entry_id' => $productId, 'quantity' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
                $row = ['quantity' => 0, 'low_at' => null];
            }
            $before = (int) $row['quantity'];
            $after = $reason === 'counted' ? $amount : $before + $amount;
            if ($after < 0) {
                throw new InvalidArgumentException("Only {$before} in stock.");
            }
            if ($after > self::MAX_QUANTITY) {
                throw new InvalidArgumentException('That is more than the catalog can count.');
            }
            $change = $after - $before;
            if ($change === 0 && $reason !== 'counted') {
                throw new InvalidArgumentException('The change is zero.');
            }
            QueryBuilder::table('p_catalog_stock')->where('entry_id', $productId)->update(['quantity' => $after, 'updated_at' => date('Y-m-d H:i:s')]);
            $id = (int) QueryBuilder::table('p_catalog_stock_movements')->insert([
                'entry_id' => $productId, 'change' => $change, 'quantity_after' => $after, 'reason' => $reason,
                'note' => $note === null || trim($note) === '' ? null : mb_substr(trim($note), 0, 200),
                'user_id' => $userId, 'created_at' => date('Y-m-d H:i:s'),
            ]);

            return ['id' => $id, 'change' => $change, 'quantity' => $after, 'before' => $before, 'low_at' => isset($row['low_at']) ? (int) $row['low_at'] : self::defaultLowAt()];
        });

        // Events after the commit, so listeners (and later webhooks) never see a change that was rolled back.
        if ($this->events !== null && $result['change'] !== 0) {
            $this->events->dispatch(new StockChanged($productId, $result['change'], $result['quantity'], $reason));
            if ($result['quantity'] <= $result['low_at'] && $result['before'] > $result['low_at']) {
                $this->events->dispatch(new StockLow($productId, $result['quantity'], $result['low_at']));
            }
        }

        return ['id' => $result['id'], 'change' => $result['change'], 'quantity' => $result['quantity']];
    }

    /** Set or clear (null) a product's own low-stock level. */
    public function setLowAt(int $productId, ?int $lowAt): void
    {
        $this->assertProduct($productId);
        if ($lowAt !== null && ($lowAt < 0 || $lowAt > self::MAX_QUANTITY)) {
            throw new InvalidArgumentException('Choose a level between 0 and ' . self::MAX_QUANTITY . '.');
        }
        $exists = QueryBuilder::table('p_catalog_stock')->where('entry_id', $productId)->exists();
        $exists
            ? QueryBuilder::table('p_catalog_stock')->where('entry_id', $productId)->update(['low_at' => $lowAt, 'updated_at' => date('Y-m-d H:i:s')])
            : QueryBuilder::table('p_catalog_stock')->insert(['entry_id' => $productId, 'quantity' => 0, 'low_at' => $lowAt, 'updated_at' => date('Y-m-d H:i:s')]);
    }

    /** @return list<array{id: int, change: int, quantity_after: int, reason: string, note: ?string, user: ?string, created_at: ?string}> newest first */
    public function movements(int $productId, int $limit = 50): array
    {
        $rows = QueryBuilder::table('p_catalog_stock_movements')
            ->leftJoin('users', 'users.id', '=', 'p_catalog_stock_movements.user_id')
            ->select('p_catalog_stock_movements.*', 'users.username')
            ->where('p_catalog_stock_movements.entry_id', $productId)
            ->orderByDesc('p_catalog_stock_movements.id')->limit($limit)->get();

        return array_map(static fn(array $r) => [
            'id' => (int) $r['id'], 'change' => (int) $r['change'], 'quantity_after' => (int) $r['quantity_after'], 'reason' => (string) $r['reason'],
            'note' => $r['note'], 'user' => $r['username'] ?? null, 'created_at' => $r['created_at'],
        ], $rows);
    }

    /**
     * Products (not in the trash) for the stock screen, with their levels.
     *
     * @return array{data: list<array<string, mixed>>, total: int}
     */
    public function list(?string $search = null, bool $lowOnly = false, int $page = 1, int $perPage = 25): array
    {
        $q = QueryBuilder::table('entries')
            ->leftJoin('p_catalog_stock', 'p_catalog_stock.entry_id', '=', 'entries.id')
            ->where('entries.type', self::PRODUCT)->whereNull('entries.deleted_at');
        if ($search !== null && trim($search) !== '') {
            $q->whereLike('entries.title', '%' . QueryBuilder::escapeLike(trim($search)) . '%');
        }
        if ($lowOnly) {
            $default = self::defaultLowAt();
            $q->whereRaw('COALESCE(p_catalog_stock.quantity, 0) <= COALESCE(p_catalog_stock.low_at, ?)', [$default]);
        }
        $total = (clone $q)->count();
        $rows = $q->select('entries.id', 'entries.title', 'entries.status', 'entries.data')
            ->selectRaw('COALESCE(p_catalog_stock.quantity, 0) AS stock_quantity')
            ->orderBy('stock_quantity')->orderBy('entries.title')->orderBy('entries.id')
            ->forPage($page, $perPage)->get();
        $levels = $this->levels(array_map(static fn(array $r) => (int) $r['id'], $rows));

        return ['total' => $total, 'data' => array_map(static function (array $r) use ($levels): array {
            $data = is_string($r['data']) ? (json_decode($r['data'], true) ?: []) : (array) ($r['data'] ?? []);

            return ['id' => (int) $r['id'], 'title' => (string) $r['title'], 'status' => (string) $r['status'], 'sku' => (string) ($data['sku'] ?? '')] + $levels[(int) $r['id']];
        }, $rows)];
    }

    private function assertProduct(int $productId): void
    {
        if (!QueryBuilder::table('entries')->where('id', $productId)->where('type', self::PRODUCT)->exists()) {
            throw new InvalidArgumentException('No such product.');
        }
    }
}
