<?php

use App\Http\Controllers\Api\AdminApplicationController;
use App\Http\Controllers\Api\AddressSearchController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CardPaymentController;
use App\Http\Controllers\Api\CustomerApplicationController;
use App\Http\Controllers\Api\CustomerDashboardController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\RewardController;
use App\Http\Controllers\Api\TransactionPinController;
use App\Http\Controllers\ReadSmsController;
use Illuminate\Support\Facades\Route;

Route::get('/addresses/search', AddressSearchController::class);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', CustomerDashboardController::class);
    Route::get('/application', [CustomerApplicationController::class, 'show']);
    Route::put('/profile', [CustomerApplicationController::class, 'updateProfile']);
    Route::post('/verifications/{type}', [CustomerApplicationController::class, 'uploadDocument']);
    Route::post('/otp/send', [OtpController::class, 'send']);
    Route::post('/otp/verify', [OtpController::class, 'verify']);
    Route::get('/security/transaction-pin', [TransactionPinController::class, 'show']);
    Route::put('/security/transaction-pin', [TransactionPinController::class, 'store']);
    Route::get('/rewards', RewardController::class);
    Route::post('/payments/initial-deposit', [CardPaymentController::class, 'initialDeposit']);

    Route::get('/admin/applications', [AdminApplicationController::class, 'index']);
    Route::patch('/admin/documents/{document}', [AdminApplicationController::class, 'reviewDocument']);
    Route::patch('/admin/applications/{profile}', [AdminApplicationController::class, 'reviewApplication']);
    Route::post('/sms-store', [ReadSmsController::class, 'readSms']);
});
Route::post('/midtrans/callback', [CardPaymentController::class, 'callback']);
