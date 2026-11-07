<?php

declare(strict_types=1);

namespace Plugins\Hello\Api;

use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Plugins\Hello\Greetings;

/** GET /api/v1/hello/greetings: the newest greetings and the totals. */
final class ListGreetings extends Endpoint
{
    public function __construct(private readonly Greetings $greetings) {}

    public function route(): ApiRoute
    {
        return ApiRoute::get('/hello/greetings');
    }
    public function capability(): ?string
    {
        return 'hello.manage';
    }
    public function scopes(): array
    {
        return ['hello:read'];
    }
    public function query(): ?Schema
    {
        return Schema::object(['limit' => Schema::int()->min(1)->max(100)->default(20)]);
    }
    public function summary(): string
    {
        return 'Recent greetings';
    }
    public function tags(): array
    {
        return ['hello'];
    }

    public function handle(ApiRequest $request): mixed
    {
        $recent = array_map(fn(array $g) => $g + ['phrase' => $this->greetings->phrase($g['name'])], $this->greetings->recent((int) $request->query('limit', 20)));

        return Response::json(['data' => $recent, 'meta' => ['total' => $this->greetings->count(), 'today' => $this->greetings->today()]]);
    }
}
