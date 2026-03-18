<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
if (!$user) {
    echo "No user found\n";
    exit;
}

$cartItem = App\Models\CartItem::where('user_id', $user->id)->first();
if (!$cartItem) {
    $category = App\Models\Category::firstOrCreate(['name' => 'Test', 'slug' => 'test']);
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
try {
   $response = $controller->store($request);
   echo $response->getContent();
} catch (\Illuminate\Validation\ValidationException $e) {
   echo json_encode(['validation' => $e->errors()]);
} catch (\Throwable $e) {
   echo 'ERROR: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
}
