<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::all();
foreach ($users as $u) {
    echo "id={$u->id} email={$u->email} name={$u->name} is_admin=" . ($u->is_admin ? '1' : '0') . " created_at={$u->created_at}\n";
}
