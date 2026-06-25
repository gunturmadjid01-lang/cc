<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('credit_card_profile_id')->constrained()->cascadeOnDelete();
            $table->string('order_id')->unique();
            $table->string('type')->default('initial_deposit');
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('pending');
            $table->string('midtrans_token')->nullable();
            $table->string('midtrans_redirect_url')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_payments');
    }
};
