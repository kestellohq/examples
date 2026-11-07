<?php

declare(strict_types=1);

namespace Plugins\Catalog\Events;

/**
 * A stock movement was saved: stock was received, sold, returned,
 * counted or written off. Plain data, so listeners (a marketplace sync,
 * an accounting export) may run in the background with #[Queued].
 */
final readonly class StockChanged
{
    /**
     * @param int $productId The product (a catalog-product entry).
     * @param int $change How much the quantity changed; negative when stock went out.
     * @param int $quantity The quantity after the change.
     * @param string $reason received, sold, returned, counted or damaged.
     */
    public function __construct(
        public int $productId,
        public int $change,
        public int $quantity,
        public string $reason,
    ) {}
}
