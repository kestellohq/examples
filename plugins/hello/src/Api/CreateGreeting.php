<?php

declare(strict_types=1);

namespace Plugins\Hello\Api;

use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Plugins\Hello\Greetings;

/** POST /api/v1/hello/greetings {name}: greet someone. */
final class CreateGreeting extends Endpoint
{
    public function __construct(private readonly Greetings $greetings) {}

    public function route(): ApiRoute
    {
        return ApiRoute::post('/hello/greetings');
    }
    public function capability(): ?string
    {
        return 'hello.manage';
    }
    public function scopes(): array
    {
        return ['hello:write'];
    }
    public function body(): ?Schema
    {
        return Schema::object(['name' => Schema::string()->min(1)->max(40)->pattern('[A-Za-z][A-Za-z0-9 _-]*')]);
    }
    public function rateLimit(): ?array
    {
        return [30, 60];
    }
    public function summary(): string
    {
        return 'Greet someone';
    }
    public function tags(): array
    {
        return ['hello'];
    }

    public function handle(ApiRequest $request): mixed
    {
        $name = (string) $request->input('name');
        $id = $this->greetings->record($name);

        return Response::json(['data' => ['id' => $id, 'name' => $name, 'phrase' => $this->greetings->phrase($name), 'count' => $this->greetings->countFor($name)]], 201);
    }
}
