<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

$cats = Category::orderBy('id')->get();
if ($cats->isEmpty()) {
    echo "No categories found.\n";
    exit;
}
foreach ($cats as $c) {
    echo "id={$c->id} name={$c->name} created_at={$c->created_at}\n";
}
