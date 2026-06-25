<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->boolean('status_profile')->default(false)->after('application_status');
        });

        DB::table('credit_card_profiles')
            ->whereNotNull('nik')
            ->update(['status_profile' => true]);
    }

    public function down(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->dropColumn('status_profile');
        });
    }
};
