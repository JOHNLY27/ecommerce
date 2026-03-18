<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Category;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue = Order::where('status', 'completed')->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalUsers = User::count();

        return response()->json([
            'revenue' => $totalRevenue,
            'orders' => $totalOrders,
            'products' => $totalProducts,
            'users' => $totalUsers,
        ]);
    }

    public function orders()
    {
        $orders = Order::with(['user', 'items.product', 'items.variant'])->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::with('user')->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;
        $order->status = $newStatus;
        $order->save();

        // Notify the customer if they have enabled notifications for this status
        try {
            $user = $order->user;
            if ($user) {
                $settings = $user->notification_settings ?? [];
                // if not set, default to true
                $enabled = array_key_exists($newStatus, $settings) ? (bool) $settings[$newStatus] : true;
                if ($enabled) {
                    // send database notification
                    \App\Notifications\OrderStatusUpdated::class;
                    $user->notify(new \App\Notifications\OrderStatusUpdated($order, $newStatus));
                }
            }
        } catch (\Exception $e) {
            // log but don't block admin action
            \Log::error('Failed to notify user about order status: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Order status updated successfully', 'order' => $order]);
    }

    public function products()
    {
        $products = Product::with(['category', 'variants'])->orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image_url' => 'nullable|url',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'is_new_arrival' => 'boolean',
            'is_sale' => 'boolean'
        ]);

        // If marked as sale, ensure category is SALE and assign its id
        if (!empty($validated['is_sale'])) {
            $saleCategory = Category::firstOrCreate(['name' => 'SALE']);
            $validated['category_id'] = $saleCategory->id;
        }

        $product = Product::create($validated);
        return response()->json($product->load('category', 'variants'), 201);
    }


    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image_url' => 'nullable|url',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'is_new_arrival' => 'boolean',
            'is_sale' => 'boolean'
        ]);

        // If marked as sale, ensure category is SALE and assign its id
        if (!empty($validated['is_sale'])) {
            $saleCategory = Category::firstOrCreate(['name' => 'SALE']);
            $validated['category_id'] = $saleCategory->id;
        }

        $product->update($validated);
        return response()->json($product->load('category', 'variants'));
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    // ==================== VARIANT MANAGEMENT ====================

    /**
     * Get variants for a specific product.
     */
    public function getProductVariants($productId)
    {
        $product = Product::findOrFail($productId);
        $variants = $product->variants()->orderBy('size')->orderBy('color')->get();
        return response()->json($variants);
    }

    /**
     * Store a new variant.
     */
    public function storeVariant(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'sku' => 'required|string|unique:product_variants,sku',
            'size' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image_url' => 'nullable|url',
            'is_active' => 'boolean'
        ]);

        $validated['product_id'] = $productId;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $variant = ProductVariant::create($validated);
        return response()->json($variant, 201);
    }

    /**
     * Update a variant.
     */
    public function updateVariant(Request $request, $productId, $variantId)
    {
        $variant = ProductVariant::where('product_id', $productId)
            ->where('id', $variantId)
            ->firstOrFail();

        $validated = $request->validate([
            'sku' => 'sometimes|required|string|unique:product_variants,sku,' . $variantId,
            'size' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'image_url' => 'nullable|url',
            'is_active' => 'boolean'
        ]);

        $variant->update($validated);
        return response()->json($variant);
    }

    /**
     * Delete a variant.
     */
    public function deleteVariant($productId, $variantId)
    {
        $variant = ProductVariant::where('product_id', $productId)
            ->where('id', $variantId)
            ->firstOrFail();

        $variant->delete();
        return response()->json(['message' => 'Variant deleted successfully']);
    }

    /**
     * Bulk create variants from size/color combinations.
     */
    public function bulkCreateVariants(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'sizes' => 'required|array',
            'colors' => 'required|array',
            'base_sku' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
        ]);

        $created = [];
        $skipped = [];

        foreach ($validated['sizes'] as $size) {
            foreach ($validated['colors'] as $color) {
                $sku = strtoupper($validated['base_sku'] . '-' . $size . '-' . str_replace(' ', '-', $color));

                // Check if SKU already exists
                if (ProductVariant::where('sku', $sku)->exists()) {
                    $skipped[] = ['size' => $size, 'color' => $color, 'sku' => $sku];
                    continue;
                }

                $variant = ProductVariant::create([
                    'product_id' => $productId,
                    'sku' => $sku,
                    'size' => $size,
                    'color' => $color,
                    'price' => $validated['price'] ?? null,
                    'stock_quantity' => $validated['stock_quantity'] ?? 0,
                    'is_active' => true,
                ]);

                $created[] = $variant;
            }
        }

        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'total_created' => count($created),
            'total_skipped' => count($skipped)
        ]);
    }
}
