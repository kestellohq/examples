<?php

declare(strict_types=1);

namespace Plugins\MailLog;

use Kestello\Cms\Extension\PluginProvider;
use Kestello\Contracts\Mail\Transport;
use Kestello\Framework\Core\Container;
use Kestello\Framework\Core\Paths;

final class MailLogProvider extends PluginProvider
{
    public function register(Container $container): void
    {
        // Rebind the contract: every email now goes through LogTransport.
        $container->singleton(Transport::class, fn(Container $c) => new LogTransport(
            $c->make(Paths::class)->storage('plugins/mail-log/mail.log'),
        ));
    }
}
