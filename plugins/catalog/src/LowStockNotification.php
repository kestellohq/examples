<?php

declare(strict_types=1);

namespace Plugins\Catalog;

use Kestello\Cms\Notifications\MailMessage;
use Kestello\Cms\Notifications\Notification;
use Kestello\Cms\Notifications\Recipient;

/** "3 products are running low", in the admin inbox and by email. People can switch either off on their profile. */
final class LowStockNotification extends Notification
{
    /** @param list<array{id: int, title: string, sku: string, quantity: int}> $items the first ten */
    public function __construct(public readonly int $total, public readonly array $items, public readonly string $siteUrl) {}

    public function type(): string
    {
        return 'catalog.low-stock';
    }

    public function via(Recipient $to): array
    {
        return ['database', 'mail'];
    }

    /** @return array<string, mixed> */
    public function toDatabase(Recipient $to): array
    {
        return ['title' => $this->title(), 'body' => $this->names(), 'url' => '/admin/p/catalog/stock?low=1', 'icon' => 'package'];
    }

    public function toMail(Recipient $to): MailMessage
    {
        $mail = MailMessage::make($this->title())->line('These products are at or below their low-stock level:');
        foreach ($this->items as $item) {
            $mail->line(sprintf('%s%s: %d left', $item['title'], $item['sku'] !== '' ? " ({$item['sku']})" : '', $item['quantity']));
        }
        if ($this->total > count($this->items)) {
            $mail->line(sprintf('And %d more.', $this->total - count($this->items)));
        }

        return $mail->action('Open the stock screen', $this->siteUrl . '/admin/p/catalog/stock?low=1');
    }

    private function title(): string
    {
        return $this->total === 1 ? '1 product is running low' : "{$this->total} products are running low";
    }

    private function names(): string
    {
        $names = array_map(static fn(array $i) => $i['title'], array_slice($this->items, 0, 3));

        return implode(', ', $names) . ($this->total > count($names) ? sprintf(' and %d more', $this->total - count($names)) : '');
    }
}
