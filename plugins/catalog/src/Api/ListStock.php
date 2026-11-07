<?php

declare(strict_types=1);

namespace Plugins\Catalog\Api;

use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Plugins\Catalog\Stock;

/** GET /api/v1/catalog/stock: every product with its quantity and low-stock level, lowest first. */
final class ListStock extends Endpoint
{
    public function __construct(private readonly Stock $stock) {}

    public function route(): ApiRoute
    {
        return ApiRoute::get('/catalog/stock');
    }
    public function capability(): ?string
    {
        return 'catalog.view_stock';
    }
    public function scopes(): array
    {
        return ['catalog:read'];
    }
    public function summary(): string
    {
        return 'Stock levels';
    }
    public function tags(): array
    {
        return ['catalog'];
    }

    public function query(): ?Schema
    {
        return Schema::object([
            'page' => Schema::int()->min(1)->max(10000)->default(1),
            'per_page' => Schema::int()->min(1)->max(100)->default(25),
            'search' => Schema::string()->max(100)->optional(),
            'low' => Schema::bool()->default(false)->description('Only products at or below their low-stock level'),
        ]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $perPage = (int) $request->query('per_page');
        $result = $this->stock->list($request->query('search'), (bool) $request->query('low'), (int) $request->query('page'), $perPage);

        return Response::json(['data' => $result['data'], 'meta' => [
            'total' => $result['total'], 'page' => (int) $request->query('page'), 'per_page' => $perPage, 'last_page' => max(1, (int) ceil($result['total'] / $perPage)),
            'default_low_at' => Stock::defaultLowAt(), 'reasons' => Stock::REASONS,
        ]]);
    }
}
