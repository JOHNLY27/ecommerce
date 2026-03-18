<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "DB: " . DB::connection()->getDatabaseName() . PHP_EOL;
    echo "getenv(DB_DATABASE): " . getenv('DB_DATABASE') . PHP_EOL;
    echo "_ENV DB_DATABASE: " . (isset($_ENV['DB_DATABASE']) ? $_ENV['DB_DATABASE'] : 'not set') . PHP_EOL;
    echo "_SERVER DB_DATABASE: " . (isset($_SERVER['DB_DATABASE']) ? $_SERVER['DB_DATABASE'] : 'not set') . PHP_EOL;
    $rows = DB::select('SHOW TABLES');
    echo "Tables:\n";
    foreach ($rows as $r) {
        $vals = array_values((array)$r);
        echo "- " . $vals[0] . PHP_EOL;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
