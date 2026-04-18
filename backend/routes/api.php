<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CouponController;

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
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

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

    // Wishlist routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    // Coupon validation and list
    Route::get('/coupons/active', [CouponController::class, 'getActiveCoupons']);
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/refund', [OrderController::class, 'requestRefund']);
    Route::post('/orders/{id}/received', [OrderController::class, 'markReceived']);
    Route::get('/orders/{id}/reviewable-products', [OrderController::class, 'getReviewableProducts']);

    // Review routes
    Route::get('/products/{productId}/reviews', [\App\Http\Controllers\ReviewController::class, 'index']);
    Route::post('/products/{productId}/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);
    Route::put('/products/{productId}/reviews/{reviewId}', [\App\Http\Controllers\ReviewController::class, 'update']);
    Route::delete('/products/{productId}/reviews/{reviewId}', [\App\Http\Controllers\ReviewController::class, 'destroy']);
    Route::post('/products/{productId}/reviews/{reviewId}/helpful', [\App\Http\Controllers\ReviewController::class, 'markHelpful']);
    Route::get('/products/{productId}/can-review', [\App\Http\Controllers\ReviewController::class, 'canReview']);

    // Admin routes
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminDashboardController::class, 'stats']);
        Route::get('/orders', [\App\Http\Controllers\AdminDashboardController::class, 'orders']);
        Route::put('/orders/{id}/status', [\App\Http\Controllers\AdminDashboardController::class, 'updateOrderStatus']);
        Route::get('/products', [\App\Http\Controllers\AdminDashboardController::class, 'products']);
        Route::post('/products', [\App\Http\Controllers\AdminDashboardController::class, 'storeProduct']);
        Route::put('/products/{id}', [\App\Http\Controllers\AdminDashboardController::class, 'updateProduct']);
        Route::delete('/products/{id}', [\App\Http\Controllers\AdminDashboardController::class, 'deleteProduct']);
        Route::get('/customers', [\App\Http\Controllers\AdminDashboardController::class, 'customers']);
        
        // Coupons
        Route::get('/coupons', [\App\Http\Controllers\AdminDashboardController::class, 'coupons']);
        Route::post('/coupons', [\App\Http\Controllers\AdminDashboardController::class, 'storeCoupon']);
        Route::delete('/coupons/{id}', [\App\Http\Controllers\AdminDashboardController::class, 'deleteCoupon']);
        
        // Categories
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Product Variants
        Route::get('/products/{productId}/variants', [\App\Http\Controllers\AdminDashboardController::class, 'getProductVariants']);
        Route::post('/products/{productId}/variants', [\App\Http\Controllers\AdminDashboardController::class, 'storeVariant']);
        Route::post('/products/{productId}/variants/bulk', [\App\Http\Controllers\AdminDashboardController::class, 'bulkCreateVariants']);
        Route::put('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\AdminDashboardController::class, 'updateVariant']);
        Route::delete('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\AdminDashboardController::class, 'deleteVariant']);
        // Reports & Analytics
        Route::get('/reports/sales', [\App\Http\Controllers\AdminReportController::class, 'salesReport']);
        Route::get('/reports/monthly', [\App\Http\Controllers\AdminReportController::class, 'monthlyReport']);
        Route::get('/reports/products', [\App\Http\Controllers\AdminReportController::class, 'productReport']);
        Route::get('/reports/export', [\App\Http\Controllers\AdminReportController::class, 'exportReport']);
        // Payment method settings (admin)
        Route::get('/payment-method', [\App\Http\Controllers\AdminPaymentMethodController::class, 'show']);
        Route::put('/payment-method', [\App\Http\Controllers\AdminPaymentMethodController::class, 'update']);
        // Review Moderation
        Route::get('/reviews', [\App\Http\Controllers\AdminReviewController::class, 'index']);
        Route::post('/reviews/{id}/approve', [\App\Http\Controllers\AdminReviewController::class, 'approve']);
        Route::post('/reviews/{id}/reject', [\App\Http\Controllers\AdminReviewController::class, 'reject']);
        Route::post('/reviews/{id}/feature', [\App\Http\Controllers\AdminReviewController::class, 'toggleFeatured']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\AdminReviewController::class, 'destroy']);
        Route::post('/reviews/bulk-approve', [\App\Http\Controllers\AdminReviewController::class, 'bulkApprove']);
        Route::post('/reviews/bulk-delete', [\App\Http\Controllers\AdminReviewController::class, 'bulkDelete']);
    });
});
