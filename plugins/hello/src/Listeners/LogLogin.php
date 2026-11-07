<?php

declare(strict_types=1);

namespace Plugins\Hello\Listeners;

use Kestello\Cms\Cms;
use Kestello\Cms\Events\UserLoggedIn;
use Kestello\Framework\Events\Queued;
use Kestello\Framework\Log\Logger;

/**
 * A queued event listener: #[Queued] makes it run on the "low" queue in
 * the background instead of during the sign-in request.
 */
#[Queued(queue: 'low')]
final class LogLogin
{
    public function handle(UserLoggedIn $event, ?Cms $cms = null): void
    {
        $cms ??= Cms::instance();
        if ($cms !== null) {
            (new Logger($cms->paths->logs()))->info("hello: {$event->user['username']} logged in ({$event->method})");
        }
    }
}
