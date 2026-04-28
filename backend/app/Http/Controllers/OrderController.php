<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Notifications\AdminEventNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->orders()->with(['items.product', 'items.variant'])->orderBy('created_at', 'desc')->get());
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
            'selected_item_ids.*' => 'integer|exists:cart_items,id,user_id,'.$user->id,
            'coupon_code' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'customer_note' => 'nullable|string|max:1000'
        ]);

        $coupon = null;
        $discountAmount = 0;
        if ($request->coupon_code) {
            $coupon = \App\Models\Coupon::where('code', strtoupper($request->coupon_code))->first();
            if ($coupon && $coupon->is_active) {
                if ((!$coupon->expires_at || now()->lessThan($coupon->expires_at)) && 
                    (!$coupon->usage_limit || $coupon->used_count < $coupon->usage_limit)) {
                    // Valid coupon
                } else {
                    $coupon = null;
                }
            } else {
                $coupon = null;
            }
        }

        $cartItems = $user->cartItems()->whereIn('id', $request->selected_item_ids)->with(['product', 'variant'])->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty or items not found'], 400);
        }

        // Calculate total and validate stock
        $totalAmount = 0;
        foreach ($cartItems as $item) {
            $price = $item->variant ? $item->variant->effective_price : $item->product->price;
            $totalAmount += $item->quantity * $price;

            // Check stock for variants
            if ($item->variant_id && $item->variant) {
                if ($item->variant->stock_quantity < $item->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock for {$item->product->name} ({$item->variant->size}/{$item->variant->color})"
                    ], 400);
                }
            }
        }

        if ($coupon) {
            if ($coupon->type === 'percent') {
                $discountAmount = $totalAmount * ($coupon->value / 100);
            } else {
                $discountAmount = $coupon->value;
            }
            if ($discountAmount > $totalAmount) {
                $discountAmount = $totalAmount;
            }
            $totalAmount -= $discountAmount;
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'address' => $request->address,
                'contact' => $request->contact,
                'city' => $request->city,
                'coupon_code' => $coupon ? $coupon->code : null,
                'discount_amount' => $discountAmount,
                'customer_note' => $request->customer_note,
                'reference_number' => $request->reference_number
            ]);

            if ($coupon) {
                $coupon->increment('used_count');
            }

            foreach ($cartItems as $item) {
                $price = $item->variant ? $item->variant->effective_price : $item->product->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $price,
                    'size' => $item->display_size,
                    'color' => $item->display_color
                ]);

                // Deduct stock from variant
                if ($item->variant_id && $item->variant) {
                    $item->variant->decrement('stock_quantity', $item->quantity);
                }
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

            // Send order confirmation email to the customer
            try {
                Mail::to($user->email)->queue(new OrderConfirmationMail($order));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Order Confirmation Email Failed: ' . $e->getMessage());
            }

            return response()->json($order->load(['items.product', 'items.variant']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with(['items.product', 'items.variant'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Mark order as received by customer.
     */
    public function markReceived(Request $request, $id)
    {
        $order = $request->user()->orders()->with(['items.product'])->findOrFail($id);

        if (!$order->canBeReceived()) {
            return response()->json([
                'message' => 'This order cannot be marked as received. It must be completed first.'
            ], 400);
        }

        $order->update(['received_at' => now()]);

        // Get products that can be reviewed
        $products = $order->items->map(function ($item) {
            return [
                'id' => $item->product_id,
                'name' => $item->product->name,
                'image' => $item->product->image,
                'image_url' => $item->product->image_url,
                'size' => $item->size,
                'color' => $item->color,
            ];
        })->unique('id')->values();

        return response()->json([
            'message' => 'Order marked as received successfully!',
            'order' => $order->fresh(),
            'products_to_review' => $products,
        ]);
    }

    /**
     * Get products from a received order that can be reviewed.
     */
    public function getReviewableProducts(Request $request, $id)
    {
        $order = $request->user()->orders()->with(['items.product'])->findOrFail($id);

        if (!$order->canBeReviewed()) {
            return response()->json([
                'message' => 'This order must be received before reviewing.',
                'can_review' => false,
            ], 400);
        }

        $unreviewedProducts = $order->getUnreviewedProducts();

        $products = $unreviewedProducts->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $product->image,
            ];
        })->values();

        return response()->json([
            'can_review' => true,
            'products' => $products,
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $order = $request->user()->orders()->with(['items.variant', 'items.product'])->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled.'], 400);
        }

        DB::beginTransaction();
        try {
            $order->update(['status' => 'cancelled']);

            // Restock items
            foreach ($order->items as $item) {
                if ($item->variant_id && $item->variant) {
                    $item->variant->increment('stock_quantity', $item->quantity);
                } else if ($item->product) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Order cancelled successfully', 'order' => $order]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel order'], 500);
        }
    }

    public function requestRefund(Request $request, $id)
    {
        $order = $request->user()->orders()->findOrFail($id);

        // Can only refund if marked completed or received
        if ($order->status !== 'completed' && $order->status !== 'delivered') {
            return response()->json(['message' => 'Only completed or delivered orders can be refunded.'], 400);
        }

        $order->update(['status' => 'refund_requested']);
        return response()->json(['message' => 'Refund requested successfully', 'order' => $order]);
    }
}
