<?php

declare(strict_types=1);

namespace Plugins\Hello;

use Kestello\Cms\Cms;
use Kestello\Cms\Queue\Middleware\RateLimited;
use Kestello\Contracts\Queue\Job;
use Kestello\Contracts\Queue\JobMiddleware;
use Kestello\Framework\Log\Logger;

/** Example background job: records a greeting later. */
final class GreetJob implements Job
{
    public function __construct(public readonly string $name) {}

    /**
     * Job middleware: at most 60 greetings a minute across all workers; the rest wait.
     *
     * @return list<JobMiddleware>
     */
    public function middleware(): array
    {
        return [new RateLimited('hello-greetings', max: 60, perSeconds: 60)];
    }

    public function handle(Greetings $greetings, Cms $cms): void
    {
        $greetings->record($this->name);
        (new Logger($cms->paths->logs()))->info("hello: greeted {$this->name} in the background");
    }
}
