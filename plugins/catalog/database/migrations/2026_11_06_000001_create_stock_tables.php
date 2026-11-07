<?php

declare(strict_types=1);

use Kestello\Framework\Database\Blueprint;
use Kestello\Framework\Database\Migration;

/**
 * Stock lives in the plugin's own tables, not in the product's fields:
 * every change is a movement, and the current quantity is kept beside it
 * so lists never have to add up the history. Both point at the product
 * entry and go with it when it is deleted for good.
 */
return new class extends Migration {
    public function up(): void
    {
        $this->schema()->create('p_catalog_stock', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('entry_id')->constrained('entries')->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('low_at')->nullable();          // null: the site-wide level from Settings → Catalog
            $table->timestamp('updated_at')->nullable();
            $table->uniqueIndex('entry_id');
            $table->index('quantity');
        });

        $this->schema()->create('p_catalog_stock_movements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('entry_id')->constrained('entries')->cascadeOnDelete();
            $table->integer('change');
            $table->integer('quantity_after');
            $table->string('reason', 20);
            $table->string('note', 200)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
            $table->index('entry_id', 'id');
        });
    }

    public function down(): void
    {
        $this->schema()->dropIfExists('p_catalog_stock_movements');
        $this->schema()->dropIfExists('p_catalog_stock');
    }
};
