<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('sort') && $request->sort === 'new') {
            $query->where('is_new_arrival', true);
        }

        // Filter sale items when requested
        if ($request->has('is_sale') && $request->is_sale) {
            $query->where('is_sale', true);
        }

        $products = $query->get()->map(function ($product) {
            // Add review stats to each product
            $product->average_rating = $product->average_rating;
            $product->reviews_count = $product->reviews_count;
            return $product;
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'variants' => function($query) {
            $query->where('is_active', true)->orderBy('size')->orderBy('color');
        }])->findOrFail($id);

        // Add available sizes and colors from variants
        $product->available_sizes = $product->available_sizes;
        $product->available_colors = $product->available_colors;

        // Add review stats
        $product->average_rating = $product->average_rating;
        $product->reviews_count = $product->reviews_count;
        $product->rating_distribution = $product->rating_distribution;

        return response()->json($product);
    }
}
