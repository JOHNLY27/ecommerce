<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentMethod;

class AdminPaymentMethodController extends Controller
{
    public function show()
    {
        $pm = PaymentMethod::first();
        if (!$pm) {
            $pm = PaymentMethod::create([
                'cod_enabled' => false,
                'gcash_enabled' => false,
            ]);
        }
        return response()->json($pm);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'cod_enabled' => 'required|boolean',
            'gcash_enabled' => 'required|boolean',
        ]);

        $pm = PaymentMethod::first();
        if (!$pm) {
            $pm = PaymentMethod::create($data);
        } else {
            $pm->update($data);
        }

        return response()->json(['message' => 'Payment methods updated', 'data' => $pm]);
    }
}
