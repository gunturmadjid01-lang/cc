<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->string('district')->nullable()->after('province');
            $table->string('locality')->nullable()->after('district');
            $table->text('work_address')->nullable()->after('company_name');
            $table->string('work_city')->nullable()->after('work_address');
            $table->string('work_province')->nullable()->after('work_city');
            $table->string('work_district')->nullable()->after('work_province');
            $table->string('work_locality')->nullable()->after('work_district');
            $table->string('work_postal_code', 12)->nullable()->after('work_locality');
        });
    }

    public function down(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'district',
                'locality',
                'work_address',
                'work_city',
                'work_province',
                'work_district',
                'work_locality',
                'work_postal_code',
            ]);
        });
    }
};
