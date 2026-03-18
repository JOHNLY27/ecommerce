<?php
require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Models\User;

$user = User::where('email','admin@primewear.com')->first();
if (!$user) {
    echo "admin user not found\n";
    exit(1);
}

// Create cart item
$req = Request::create('/api/cart', 'POST', ['product_id' => 1, 'quantity' => 1]);
$req->setUserResolver(function() use ($user) { return $user; });
$cartController = new CartController();
$cartResp = $cartController->store($req);

if (method_exists($cartResp, 'getContent')) {
    $body = $cartResp->getContent();
    echo "Cart response: $body\n";
    $data = json_decode($body, true);
    $cartItemId = $data['id'] ?? null;
} else {
    var_export($cartResp);
    exit(1);
}

if (!$cartItemId) {
    echo "Failed to create cart item\n";
    exit(1);
}

// Create order
$orderReq = Request::create('/api/orders', 'POST', [
    'payment_method' => 'COD',
    'address' => '123 Test St',
    'contact' => '09171234567',
    'city' => 'Test City',
    'selected_item_ids' => [$cartItemId]
]);
$orderReq->setUserResolver(function() use ($user) { return $user; });

$orderController = new OrderController();
$orderResp = $orderController->store($orderReq);

if (method_exists($orderResp, 'getContent')) {
    $body = $orderResp->getContent();
    echo "Order response: $body\n";
} else {
    var_export($orderResp);
}
