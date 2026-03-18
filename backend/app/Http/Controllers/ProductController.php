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

        return response()->json($query->get());
    }

    public function show($id)
    {
        return response()->json(Product::with('category')->findOrFail($id));
    }
}
