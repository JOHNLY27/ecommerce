<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\AdminEventNotification;
use Illuminate\Support\Facades\Notification;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->cartItems()->with(['product', 'variant'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        $user = $request->user();
        $variantId = $request->variant_id;

        // If variant_id is provided, verify it belongs to the product
        if ($variantId) {
            $variant = ProductVariant::where('id', $variantId)
                ->where('product_id', $request->product_id)
                ->first();
            
            if (!$variant) {
                return response()->json(['message' => 'Invalid variant for this product'], 400);
            }

            // Check stock
            if ($variant->stock_quantity < $request->quantity) {
                return response()->json(['message' => 'Insufficient stock for this variant'], 400);
            }
        }

        // Find existing cart item (by variant_id if provided, otherwise by size/color)
        $query = CartItem::where('user_id', $user->id)
            ->where('product_id', $request->product_id);

        if ($variantId) {
            $query->where('variant_id', $variantId);
        } else {
            $query->where('size', $request->size)
                  ->where('color', $request->color)
                  ->whereNull('variant_id');
        }

        $item = $query->first();

        if ($item) {
            $item->quantity += $request->quantity;
            $item->save();
        } else {
            $item = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'variant_id' => $variantId,
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
                $variantInfo = $item->variant ? " ({$item->variant->size}/{$item->variant->color})" : '';
                $message = "Customer {$user->name} added {$product->name}{$variantInfo} to cart.";
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

        return response()->json($item->load(['product', 'variant']), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        
        // Check stock if variant exists
        if ($item->variant_id && $item->variant) {
            if ($item->variant->stock_quantity < $request->quantity) {
                return response()->json(['message' => 'Insufficient stock for this variant'], 400);
            }
        }
        
        $item->quantity = $request->quantity;
        $item->save();

        return response()->json($item->load(['product', 'variant']));
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
