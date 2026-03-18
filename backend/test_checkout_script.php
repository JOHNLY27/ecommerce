<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

try {
    // Create or get test user
    $user = User::firstOrCreate(
        ['email' => 'test_checkout@example.com'],
        ['name' => 'Test Checkout', 'password' => Hash::make('secret')]
    );

    // Ensure a category exists
    $category = Category::first() ?: Category::create(['name' => 'Test Category']);

    // Create or get a test product
    $product = Product::firstOrCreate(
        ['name' => 'Test Product'],
        ['description' => 'Test product created for checkout test', 'price' => 49.99, 'stock_quantity' => 10, 'category_id' => $category->id]
    );

    // Create a cart item for the user
    $cartItem = CartItem::create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    // Prepare request to create order
    $request = Request::create('/api/orders', 'POST', [
        'payment_method' => 'COD',
        'address' => '123 Test St',
        'contact' => '09123456789',
        'city' => 'Test City',
        'selected_item_ids' => [$cartItem->id],
    ]);

    // Set authenticated user for the request
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    // Call controller
    $controller = new App\Http\Controllers\OrderController();
    $response = $controller->store($request);

    // Output response and resulting orders
    echo "Response status: " . ($response->getStatusCode() ?? 'n/a') . PHP_EOL;
    echo "Response content: " . $response->getContent() . PHP_EOL;

    $orders = Order::where('user_id', $user->id)->with('items.product')->get();
    echo "Orders for user: " . PHP_EOL;
    foreach ($orders as $o) {
        echo json_encode($o->toArray()) . PHP_EOL;
    }
} catch (Throwable $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
