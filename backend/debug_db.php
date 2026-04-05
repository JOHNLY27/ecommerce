<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

try {
    echo "Checking Database Connection...\n";
    $dbName = DB::connection()->getDatabaseName();
    echo "Current Database: $dbName\n";

    echo "\nUSER COUNT: " . User::count() . "\n";
    $users = User::all();
    foreach ($users as $u) {
        echo "- ID: {$u->id}, Name: {$u->name}, Email: {$u->email}, Admin: " . ($u->role === 'admin' || $u->is_admin ? 'YES' : 'NO') . "\n";
    }

    echo "\nPRODUCT COUNT: " . Product::count() . "\n";
    $products = Product::all();
    foreach ($products as $p) {
        echo "- ID: {$p->id}, Name: {$p->name}, Price: {$p->price}\n";
    }

} catch (\Exception $e) {
    echo "\n[ERROR] " . $e->getMessage() . "\n";
}
