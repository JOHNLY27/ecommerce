<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Carbon\Carbon;

class AdminReportController extends Controller
{
    /**
     * Get sales report with date range filtering
     */
    public function salesReport(Request $request)
    {
        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();
        
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfMonth();

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->with(['user', 'items.product'])
            ->get();

        $completedOrders = $orders->where('status', 'completed');
        
        return response()->json([
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'summary' => [
                'total_orders' => $orders->count(),
                'completed_orders' => $completedOrders->count(),
                'pending_orders' => $orders->where('status', 'pending')->count(),
                'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
                'total_revenue' => $completedOrders->sum('total_amount'),
                'average_order_value' => $completedOrders->count() > 0 
                    ? round($completedOrders->sum('total_amount') / $completedOrders->count(), 2)
                    : 0,
            ],
            'orders' => $orders,
        ]);
    }

    /**
     * Get monthly sales data for charts
     */
    public function monthlyReport(Request $request)
    {
        $months = $request->input('months', 12);
        $endDate = Carbon::now()->endOfMonth();
        $startDate = Carbon::now()->subMonths($months - 1)->startOfMonth();

        $monthlyData = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $monthStart = $current->copy()->startOfMonth();
            $monthEnd = $current->copy()->endOfMonth();

            $monthOrders = Order::whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('status', 'completed')
                ->get();

            $monthlyData[] = [
                'month' => $current->format('Y-m'),
                'month_name' => $current->format('M Y'),
                'orders' => $monthOrders->count(),
                'revenue' => round($monthOrders->sum('total_amount'), 2),
            ];

            $current->addMonth();
        }

        return response()->json([
            'months' => $months,
            'data' => $monthlyData,
        ]);
    }

    /**
     * Get top selling products report
     */
    public function productReport(Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $limit = $request->input('limit', 10);

        // Get top selling products
        $topProducts = OrderItem::selectRaw('product_id, SUM(quantity) as total_sold, SUM(quantity * price) as total_revenue')
            ->whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed');
            })
            ->with('product')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        // Get low stock products
        $lowStock = Product::where('stock_quantity', '<=', 5)
            ->with('category')
            ->orderBy('stock_quantity')
            ->get();

        return response()->json([
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'top_products' => $topProducts,
            'low_stock' => $lowStock,
        ]);
    }

    /**
     * Export orders to CSV
     */
    public function exportReport(Request $request)
    {
        $type = $request->input('type', 'orders');
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $filename = "{$type}_report_" . Carbon::now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
        ];

        $callback = function () use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            if ($type === 'orders') {
                fputcsv($file, ['Order ID', 'Date', 'Customer', 'Email', 'Status', 'Total Amount', 'Payment Method', 'City']);

                Order::whereBetween('created_at', [$startDate, $endDate])
                    ->with('user')
                    ->chunk(100, function ($orders) use ($file) {
                        foreach ($orders as $order) {
                            fputcsv($file, [
                                $order->id,
                                $order->created_at->format('Y-m-d H:i:s'),
                                $order->user ? $order->user->name : ($order->contact ?? 'Guest'),
                                $order->user ? $order->user->email : 'N/A',
                                $order->status,
                                $order->total_amount,
                                $order->payment_method,
                                $order->city ?? 'N/A',
                            ]);
                        }
                    });
            } elseif ($type === 'products') {
                fputcsv($file, ['Product ID', 'Name', 'Category', 'Price', 'Stock Quantity', 'Total Sold', 'Revenue']);

                $products = Product::with('category')->get();
                foreach ($products as $product) {
                    $sold = OrderItem::where('product_id', $product->id)
                        ->whereHas('order', function ($q) use ($startDate, $endDate) {
                            $q->whereBetween('created_at', [$startDate, $endDate])
                                ->where('status', 'completed');
                        })
                        ->sum('quantity');

                    $revenue = OrderItem::where('product_id', $product->id)
                        ->whereHas('order', function ($q) use ($startDate, $endDate) {
                            $q->whereBetween('created_at', [$startDate, $endDate])
                                ->where('status', 'completed');
                        })
                        ->sum(\DB::raw('quantity * price'));

                    fputcsv($file, [
                        $product->id,
                        $product->name,
                        $product->category ? $product->category->name : 'N/A',
                        $product->price,
                        $product->stock_quantity,
                        $sold,
                        $revenue,
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
