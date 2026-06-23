<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->string('application_number')->nullable()->unique()->after('user_id');
            $table->string('otp_code_hash')->nullable()->after('admin_notes');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code_hash');
            $table->timestamp('otp_verified_at')->nullable()->after('otp_expires_at');
            $table->timestamp('submitted_at')->nullable()->after('otp_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('credit_card_profiles', function (Blueprint $table) {
            $table->dropUnique(['application_number']);
            $table->dropColumn([
                'application_number',
                'otp_code_hash',
                'otp_expires_at',
                'otp_verified_at',
                'submitted_at',
            ]);
        });
    }
};
