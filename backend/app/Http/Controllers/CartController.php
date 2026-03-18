<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\AdminEventNotification;
use Illuminate\Support\Facades\Notification;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->cartItems()->with('product')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        $user = $request->user();
        
        $item = CartItem::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->where('size', $request->size)
            ->where('color', $request->color)
            ->first();

        if ($item) {
            $item->quantity += $request->quantity;
            $item->save();
        } else {
            $item = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'size' => $request->size,
                'color' => $request->color
            ]);
        }

        // Notify admins that a customer added an item to cart
        try {
            $admins = User::where('is_admin', true)->get();
            if ($admins->isNotEmpty()) {
                $product = $item->product()->first();
                $message = "Customer {$user->name} added {$product->name} to cart.";
                Notification::send($admins, new AdminEventNotification([
                    'type' => 'cart:add',
                    'message' => $message,
                    'user_id' => $user->id,
                    'product_id' => $product->id ?? null,
                    'link' => '/admin/orders'
                ]));
            }
        } catch (\Throwable $e) {
            // avoid breaking the API if notifications fail
        }

        return response()->json($item->load('product'), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->quantity = $request->quantity;
        $item->save();

        return response()->json($item->load('product'));
    }

    public function destroy(Request $request, $id)
    {
        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
