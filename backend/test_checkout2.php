<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $user = App\Models\User::first();
    if (!$user) {
        App\Models\User::factory()->create();
        $user = App\Models\User::first();
    }

    $cartItem = App\Models\CartItem::where('user_id', $user->id)->first();
    if (!$cartItem) {
        $category = App\Models\Category::firstOrCreate(['name' => 'Test']);
        $product = App\Models\Product::firstOrCreate(['name' => 'T', 'price' => 10, 'category_id' => $category->id]);
        $cartItem = App\Models\CartItem::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 1]);
    }

    $request = Illuminate\Http\Request::create('/api/orders', 'POST', [
        'payment_method' => 'COD',
        'address' => 'Test',
        'contact' => '1234',
        'city' => 'City',
        'selected_item_ids' => [$cartItem->id]
    ]);
    $request->setUserResolver(function() use ($user) { return $user; });

    $controller = new App\Http\Controllers\OrderController();
    $response = $controller->store($request);
    file_put_contents('checkout_error_log.txt', "RESPONSE:\n" . $response->getContent() . "\n");
} catch (\Throwable $e) {
    file_put_contents('checkout_error_log.txt', "ERROR:\n" . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n");
}
