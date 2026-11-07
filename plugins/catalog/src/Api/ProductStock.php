<?php

declare(strict_types=1);

namespace Plugins\Catalog\Api;

use Kestello\Cms\Api\ApiProblem;
use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Framework\Core\Response;
use Kestello\Framework\Database\QueryBuilder;
use Plugins\Catalog\Stock;

/** GET /api/v1/catalog/products/{id}/stock: one product's level and its recent movements. */
final class ProductStock extends Endpoint
{
    public function __construct(private readonly Stock $stock) {}

    public function route(): ApiRoute
    {
        return ApiRoute::get('/catalog/products/{id}/stock')->where('id', '\d+');
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
        return "A product's stock and history";
    }
    public function tags(): array
    {
        return ['catalog'];
    }

    public function handle(ApiRequest $request): mixed
    {
        $id = $request->intParam('id');
        $title = QueryBuilder::table('entries')->where('id', $id)->where('type', Stock::PRODUCT)->value('title');
        if ($title === null) {
            throw ApiProblem::notFound('No such product.');
        }

        return Response::json(['data' => ['id' => $id, 'title' => (string) $title] + $this->stock->level($id) + ['movements' => $this->stock->movements($id)]]);
    }
}
