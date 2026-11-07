<?php

declare(strict_types=1);

use Kestello\Framework\Database\Blueprint;
use Kestello\Framework\Database\Migration;

return new class extends Migration {
    public function up(): void
    {
        $this->schema()->create('p_hello_greetings', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 40);
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        $this->schema()->dropIfExists('p_hello_greetings');
    }
};
