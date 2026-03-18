<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // Delete test user (will cascade orders and related order_items)
    $user = User::where('email', 'test_checkout@example.com')->first();
    if ($user) {
        $userId = $user->id;
        $user->delete();
        echo "Deleted user test_checkout@example.com (id={$userId})\n";
    } else {
        echo "No test user found\n";
    }

    // Delete test product(s)
    $products = Product::where('name', 'Test Product')->get();
    if ($products->isNotEmpty()) {
        foreach ($products as $p) {
            $pid = $p->id;
            $p->delete();
            echo "Deleted product 'Test Product' (id={$pid})\n";
        }
    } else {
        echo "No 'Test Product' found\n";
    }

    // Optionally delete the test category if it exists and has no products
    $category = Category::where('name', 'Test Category')->first();
    if ($category) {
        $count = $category->products()->count();
        if ($count === 0) {
            $cid = $category->id;
            $category->delete();
            echo "Deleted category 'Test Category' (id={$cid})\n";
        } else {
            echo "Category 'Test Category' not deleted (has {$count} products)\n";
        }
    } else {
        echo "No 'Test Category' found\n";
    }

    DB::commit();
    echo "Cleanup complete.\n";
} catch (Throwable $e) {
    DB::rollBack();
    echo "Cleanup failed: " . $e->getMessage() . "\n";
}
