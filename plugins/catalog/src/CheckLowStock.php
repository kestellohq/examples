<?php

declare(strict_types=1);

namespace Plugins\Catalog;

use Kestello\Cms\Cms;
use Kestello\Contracts\Queue\Job;
use Kestello\Framework\Database\QueryBuilder;

/**
 * The daily low-stock notice (scheduled as catalog.check-low-stock).
 * Tells everyone who may manage the catalog, in the admin and by email,
 * once a day while anything is low. Nothing low, nothing sent.
 */
final class CheckLowStock implements Job
{
    public function handle(Stock $stock, Cms $cms): string
    {
        $low = $stock->list(lowOnly: true, perPage: 50);
        if ($low['total'] === 0) {
            return 'Nothing is low.';
        }
        $roles = $cms->auth->roles->rolesWith('catalog.manage');
        $users = $roles === [] ? [] : array_map('intval', QueryBuilder::table('users')->whereIn('role', $roles)->where('is_active', true)->limit(50)->pluck('id'));
        if ($users === []) {
            return "{$low['total']} low, nobody to tell.";
        }
        $items = array_map(static fn(array $p) => ['id' => $p['id'], 'title' => $p['title'], 'sku' => $p['sku'], 'quantity' => $p['quantity']], array_slice($low['data'], 0, 10));
        $cms->notifications->send($users, new LowStockNotification($low['total'], $items, rtrim((string) $cms->config->get('app.url', ''), '/')));

        return "{$low['total']} low, told " . count($users) . '.';
    }
}
