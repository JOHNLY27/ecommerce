<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        PaymentMethod::firstOrCreate([
            'id' => 1
        ], [
            'cod_enabled' => false,
            'gcash_enabled' => false,
        ]);
    }
}
