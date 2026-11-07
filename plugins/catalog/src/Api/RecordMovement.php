<?php

declare(strict_types=1);

namespace Plugins\Catalog\Api;

use InvalidArgumentException;
use Kestello\Cms\Api\ApiProblem;
use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Cms\Cms;
use Kestello\Framework\Core\Response;
use Plugins\Catalog\Stock;

/**
 * POST /api/v1/catalog/products/{id}/movements {amount, reason, note}:
 * stock in or out ("received", 12; "sold", -1), or a stock count
 * ("counted", 40) that sets the quantity.
 */
final class RecordMovement extends Endpoint
{
    public function __construct(private readonly Stock $stock, private readonly Cms $cms) {}

    public function route(): ApiRoute
    {
        return ApiRoute::post('/catalog/products/{id}/movements')->where('id', '\d+');
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
        return 'Record a stock movement';
    }
    public function tags(): array
    {
        return ['catalog'];
    }
    public function rateLimit(): ?array
    {
        return [120, 60];
    }

    public function body(): ?Schema
    {
        return Schema::object([
            'amount' => Schema::int()->min(-Stock::MAX_QUANTITY)->max(Stock::MAX_QUANTITY)->description('A change, or the counted quantity for "counted"'),
            'reason' => Schema::enum(array_keys(Stock::REASONS)),
            'note' => Schema::string()->max(200)->optional(),
        ]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $id = $request->intParam('id');
        $reason = (string) $request->input('reason');
        $amount = (int) $request->input('amount');
        if (in_array($reason, ['received', 'returned'], true) && $amount <= 0) {
            throw ApiProblem::validation(['body.amount' => ['Received and returned stock is a positive number.']]);
        }
        if (in_array($reason, ['sold', 'damaged'], true) && $amount >= 0) {
            throw ApiProblem::validation(['body.amount' => ['Sold and lost stock is a negative number.']]);
        }
        try {
            $result = $this->stock->record($id, $amount, $reason, $request->input('note'), $request->userId());
        } catch (InvalidArgumentException $e) {
            if ($e->getMessage() === 'No such product.') {
                throw ApiProblem::notFound($e->getMessage());
            }
            throw ApiProblem::validation(['body.amount' => [$e->getMessage()]]);
        }
        $this->cms->audit->record('catalog.stock_changed', ['entry', $id], ['change' => $result['change'], 'quantity' => $result['quantity'], 'reason' => $reason]);

        return Response::json(['data' => $result + $this->stock->level($id)], 201);
    }
}
