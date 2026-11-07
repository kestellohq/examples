<?php

declare(strict_types=1);

namespace Plugins\Hello\Commands;

use Kestello\Cms\Cms;
use Kestello\Framework\Console\Command;
use Plugins\Hello\Greetings;

final class GreetCommand extends Command
{
    protected string $name = 'hello:greet';
    protected string $description = 'Greet someone (example plugin command): hello:greet <name> [--later] [--batch=a,b,c]';

    public function handle(array $arguments, array $options): int
    {
        // hello:greet --batch=Ana,Bo,Cy → a batch with progress on Background jobs.
        if (($list = $this->option($options, 'batch')) !== null) {
            $names = array_values(array_filter(array_map('trim', explode(',', $list)), static fn($n) => preg_match('/^[A-Za-z][A-Za-z0-9 _-]{0,39}$/', $n) === 1));
            if ($names === []) {
                $this->output->error('  --batch needs names separated by commas.');
                return 1;
            }
            $id = Cms::instance()?->queue->batch(array_map(static fn($n) => new \Plugins\Hello\GreetJob($n), $names))
                ->name(sprintf('Greet %d %s', count($names), count($names) === 1 ? 'person' : 'people'))
                ->allowFailures()
                ->dispatch();
            $this->output->success("  Batch {$id} queued.");
            return 0;
        }

        $name = $this->argument($arguments, 0, 'world') ?? 'world';
        if ($this->hasFlag($options, 'later')) {
            Cms::instance()?->queue->push(new \Plugins\Hello\GreetJob($name));
            $this->output->success("  Queued a greeting for {$name}.");
            return 0;
        }
        $greetings = Cms::instance()?->container->make(Greetings::class);
        $greetings?->record($name);

        $this->output->success("  Hello, {$name}! (" . ($greetings?->count() ?? 0) . ' greetings so far)');

        return 0;
    }
}
