<?php

declare(strict_types=1);

namespace Plugins\Catalog\Events;

/**
 * A product's stock dropped to or below its low-stock level. Dispatched
 * once, when the level is crossed, not on every sale after it.
 */
final readonly class StockLow
{
    /**
     * @param int $productId The product.
     * @param int $quantity The quantity now.
     * @param int $lowAt The product's low-stock level (its own, or the site-wide one).
     */
    public function __construct(
        public int $productId,
        public int $quantity,
        public int $lowAt,
    ) {}
}
