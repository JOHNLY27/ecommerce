<?php
require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

$req = Request::create('/api/login', 'POST', ['email' => 'admin@primewear.com', 'password' => 'password123']);
$controller = new AuthController();
$response = $controller->login($req);

if (method_exists($response, 'getContent')) {
    echo $response->getContent();
} else {
    var_export($response);
}
