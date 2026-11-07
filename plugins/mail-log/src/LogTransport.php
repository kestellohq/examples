<?php

declare(strict_types=1);

namespace Plugins\MailLog;

use Kestello\Contracts\Mail\Message;
use Kestello\Contracts\Mail\Transport;

final class LogTransport implements Transport
{
    public function __construct(
        private readonly string $file,
    ) {}

    public function name(): string
    {
        return 'mail-log';
    }

    public function send(Message $message): bool
    {
        $dir = dirname($this->file);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $entry = sprintf(
            "=== %s\nTo: %s\nSubject: %s\n%s\n\n%s\n\n",
            date('c'),
            implode(', ', $message->to),
            $message->subject,
            implode("\n", array_map(static fn($k, $v) => "{$k}: {$v}", array_keys($message->headers), $message->headers)),
            $message->html,
        );

        return file_put_contents($this->file, $entry, FILE_APPEND | LOCK_EX) !== false;
    }
}
