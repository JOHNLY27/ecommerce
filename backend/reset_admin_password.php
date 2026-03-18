<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$targetEmail = 'admin@primewear.com';
$newPassword = 'secret1234';

$user = User::where('email', $targetEmail)->first();
if (!$user) {
    echo "Admin user not found for email {$targetEmail}\n";
    exit(1);
}
$user->password = Hash::make($newPassword);
$user->save();
echo "Password for {$targetEmail} reset to '{$newPassword}'. Please change after login.\n";
