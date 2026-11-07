<?php

declare(strict_types=1);

namespace Plugins\Catalog\Api;

use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Plugins\Catalog\Products;

/**
 * GET /api/v1/catalog/products: published products for anyone, the same
 * list the product grid shows. Headless shops read this.
 */
final class ListProducts extends Endpoint
{
    public function __construct(private readonly Products $products) {}

    public function route(): ApiRoute
    {
        return ApiRoute::get('/catalog/products');
    }
    public function isPublic(): bool
    {
        return true;
    }
    public function summary(): string
    {
        return 'Published products, with filters';
    }
    public function tags(): array
    {
        return ['catalog'];
    }
    public function rateLimit(): ?array
    {
        return [120, 60];
    }

    public function query(): ?Schema
    {
        return Schema::object([
            'page' => Schema::int()->min(1)->max(10000)->default(1),
            'per_page' => Schema::int()->min(1)->max(48)->default(12),
            'category' => Schema::string()->max(100)->pattern('[a-z0-9-]+')->optional()->description('Category slug'),
            'brand' => Schema::int()->min(1)->optional()->description('Brand entry id'),
            'min_price' => Schema::number()->min(0)->optional(),
            'max_price' => Schema::number()->min(0)->optional(),
            'in_stock' => Schema::bool()->optional(),
            'sort' => Schema::enum(array_keys(Products::SORTS))->default('newest'),
        ]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $filters = [];
        foreach (['category', 'brand', 'min_price', 'max_price', 'in_stock', 'sort'] as $key) {
            $filters[$key] = $request->query($key);
        }
        $result = $this->products->query($filters)->paginate((int) $request->query('per_page'), (int) $request->query('page'));

        return Response::json([
            'data' => $this->products->present($result['data']->all()),
            'meta' => ['total' => $result['total'], 'page' => $result['current_page'], 'per_page' => $result['per_page'], 'last_page' => $result['last_page']],
        ]);
    }
}
