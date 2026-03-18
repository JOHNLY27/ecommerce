<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Notifications\AdminEventNotification;
use Illuminate\Support\Facades\Notification;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->orders()->with('items.product')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'payment_method' => 'required|in:COD,GCash',
            'address' => 'required|string',
            'contact' => 'required|string',
            'city' => 'required|string',
            'selected_item_ids' => 'required|array|min:1',
            'selected_item_ids.*' => 'integer|exists:cart_items,id,user_id,'.$user->id
        ]);

        $cartItems = $user->cartItems()->whereIn('id', $request->selected_item_ids)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty or items not found'], 400);
        }

        $totalAmount = $cartItems->sum(function($item) {
            return $item->quantity * $item->product->price;
        });

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'address' => $request->address,
                'contact' => $request->contact,
                'city' => $request->city
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                    'size' => $item->size,
                    'color' => $item->color
                ]);
            }

            // Clear selected items from cart
            $user->cartItems()->whereIn('id', $request->selected_item_ids)->delete();

            DB::commit();

            // Notify admins about new order
            try {
                $admins = User::where('is_admin', true)->get();
                if ($admins->isNotEmpty()) {
                    $message = "New order #{$order->id} placed by {$user->name} for PHP {$order->total_amount}.";
                    Notification::send($admins, new AdminEventNotification([
                        'type' => 'order:new',
                        'message' => $message,
                        'order_id' => $order->id,
                        'user_id' => $user->id,
                        'link' => "/admin/orders/{$order->id}"
                    ]));
                }
            } catch (\Throwable $e) {
                // don't break order creation on notification failure
            }

            return response()->json($order->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product')->findOrFail($id);
        return response()->json($order);
    }
}
