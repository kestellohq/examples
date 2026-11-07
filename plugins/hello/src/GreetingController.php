<?php

declare(strict_types=1);

namespace Plugins\Hello;

use Kestello\Cms\Cms;
use Kestello\Cms\View\Page;
use Kestello\Framework\Core\Request;
use Kestello\Framework\Core\Response;

final class GreetingController
{
    public function show(Request $request, string $name): Response
    {
        $greetings = Cms::instance()?->container->make(Greetings::class);
        $greetings?->record($name);

        // Plugin pages are namespaced: "@hello/Greeting" = resources/js/pages/Greeting.vue
        return Page::render('@hello/Greeting', [
            'title' => $greetings?->phrase($name) ?? "Hello {$name}",
            'phrase' => $greetings?->phrase($name) ?? "Hello, {$name}!",
            'name' => $name,
            'greetings' => $greetings?->count() ?? 0,
        ]);
    }
}
