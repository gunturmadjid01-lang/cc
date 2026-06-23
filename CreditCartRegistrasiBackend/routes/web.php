<?php

use App\Http\Controllers\AdminWebController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [AdminWebController::class, 'loginForm'])->name('login');
    Route::post('/login', [AdminWebController::class, 'login'])->name('login.submit');
    Route::post('/logout', [AdminWebController::class, 'logout'])->name('logout');

    Route::get('/', [AdminWebController::class, 'dashboard'])->name('dashboard');
    Route::get('/applications/{profile}', [AdminWebController::class, 'show'])->name('applications.show');
    Route::post('/applications/{profile}/review', [AdminWebController::class, 'review'])->name('applications.review');
});
