<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/me', [AuthController::class, 'update']);
    Route::post('/me/password', [AuthController::class, 'changePassword']);
    Route::get('/notifications', function (Request $request) {
        return $request->user()->notifications()->orderBy('created_at', 'desc')->get();
    });

    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $notif = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notif->markAsRead();
        return response()->json(['message' => 'Notification marked as read']);
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Admin routes
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminDashboardController::class, 'stats']);
        Route::get('/orders', [\App\Http\Controllers\AdminDashboardController::class, 'orders']);
        Route::put('/orders/{id}/status', [\App\Http\Controllers\AdminDashboardController::class, 'updateOrderStatus']);
        Route::get('/products', [\App\Http\Controllers\AdminDashboardController::class, 'products']);
        Route::post('/products', [\App\Http\Controllers\AdminDashboardController::class, 'storeProduct']);
        Route::put('/products/{id}', [\App\Http\Controllers\AdminDashboardController::class, 'updateProduct']);
        Route::delete('/products/{id}', [\App\Http\Controllers\AdminDashboardController::class, 'deleteProduct']);
        // Payment method settings (admin)
        Route::get('/payment-method', [\App\Http\Controllers\AdminPaymentMethodController::class, 'show']);
        Route::put('/payment-method', [\App\Http\Controllers\AdminPaymentMethodController::class, 'update']);
    });
});
