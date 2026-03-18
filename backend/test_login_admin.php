<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@primewear.com';
$password = 'secret1234';

$user = User::where('email', $email)->first();
if (!$user) {
    echo "User not found: {$email}\n";
    exit(1);
}

echo "Stored hash: {$user->password}\n";
echo "Hash::check('{$password}') => " . (Hash::check($password, $user->password) ? 'true' : 'false') . "\n";

$request = Request::create('/api/login', 'POST', ['email' => $email, 'password' => $password]);
$controller = new AuthController();
$response = $controller->login($request);

$status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : 'n/a';
$content = method_exists($response, 'getContent') ? $response->getContent() : json_encode($response);

echo "Controller response status: {$status}\n";
echo "Controller response content: {$content}\n";
