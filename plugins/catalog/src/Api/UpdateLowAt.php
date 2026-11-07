<?php

declare(strict_types=1);

namespace Plugins\Catalog\Api;

use InvalidArgumentException;
use Kestello\Cms\Api\ApiProblem;
use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Plugins\Catalog\Stock;

/** PUT /api/v1/catalog/products/{id}/low-at {low_at}: a product's own low-stock level, or null for the site-wide one. */
final class UpdateLowAt extends Endpoint
{
    public function __construct(private readonly Stock $stock) {}

    public function route(): ApiRoute
    {
        return ApiRoute::put('/catalog/products/{id}/low-at')->where('id', '\d+');
    }
    public function capability(): ?string
    {
        return 'catalog.manage';
    }
    public function scopes(): array
    {
        return ['catalog:write'];
    }
    public function summary(): string
    {
        return "Set a product's low-stock level";
    }
    public function tags(): array
    {
        return ['catalog'];
    }

    public function body(): ?Schema
    {
        return Schema::object(['low_at' => Schema::int()->min(0)->max(Stock::MAX_QUANTITY)->nullable()]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $id = $request->intParam('id');
        $value = $request->input('low_at');
        try {
            $this->stock->setLowAt($id, $value === null ? null : (int) $value);
        } catch (InvalidArgumentException $e) {
            throw $e->getMessage() === 'No such product.' ? ApiProblem::notFound($e->getMessage()) : ApiProblem::validation(['body.low_at' => [$e->getMessage()]]);
        }

        return Response::json(['data' => ['id' => $id] + $this->stock->level($id)]);
    }
}
