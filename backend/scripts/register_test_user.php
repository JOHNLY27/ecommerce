<?php
require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

$email = 'testuser_local@example.com';
$name = 'Test User Local';
$password = 'password123';

$req = Request::create('/api/register', 'POST', ['name' => $name, 'email' => $email, 'password' => $password]);
$controller = new AuthController();
$response = $controller->register($req);

if (method_exists($response, 'getContent')) {
    echo $response->getContent();
} else {
    var_export($response);
}
