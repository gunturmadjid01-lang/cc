<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->string('card_number')->nullable()->unique()->after('credit_limit');
            $table->string('card_holder_name')->nullable()->after('card_number');
            $table->string('card_expiry_month', 2)->nullable()->after('card_holder_name');
            $table->string('card_expiry_year', 4)->nullable()->after('card_expiry_month');
            $table->decimal('available_limit', 15, 2)->nullable()->after('card_expiry_year');
            $table->decimal('initial_deposit_amount', 15, 2)->nullable()->after('available_limit');
            $table->string('initial_deposit_status')->default('not_required')->after('initial_deposit_amount');
            $table->timestamp('credit_limit_unlocked_at')->nullable()->after('initial_deposit_status');
        });
    }

    public function down(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'card_number',
                'card_holder_name',
                'card_expiry_month',
                'card_expiry_year',
                'available_limit',
                'initial_deposit_amount',
                'initial_deposit_status',
                'credit_limit_unlocked_at',
            ]);
        });
    }
};
