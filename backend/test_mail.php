<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

echo "Attempting to send test email to raffydelosreyes193@gmail.com...\n";

try {
    Mail::raw('This is a test email sent via the Resend HTTP API!', function ($message) {
        $message->to('raffydelosreyes193@gmail.com')
                ->from('onboarding@resend.dev')
                ->subject('Test Email from Primewear (Resend API)');
    });
    echo "Test email SENT successfully (or queued if sync)!\n";
} catch (\Exception $e) {
    echo "FAILED to send test email: " . $e->getMessage() . "\n";
    Log::error("Test Mail Failed: " . $e->getMessage());
}
