<?php
require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$h = DB::table('users')->where('email','admin@primewear.com')->value('password');
if (!$h) {
    echo "no password found\n";
    exit(1);
}
$ok = \Illuminate\Support\Facades\Hash::check('password123', $h);
echo $ok ? "true\n" : "false\n";
