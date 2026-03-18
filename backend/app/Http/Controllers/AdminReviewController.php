<?php

namespace App\Http\Controllers;

use App\Models\ProductReview;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    /**
     * Get all reviews for admin moderation.
     */
    public function index(Request $request)
    {
        $query = ProductReview::with(['user', 'product.category']);

        // Filter by approval status
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        // Filter by rating
        if ($request->has('rating') && in_array($request->rating, [1, 2, 3, 4, 5])) {
            $query->where('rating', $request->rating);
        }

        // Filter by verified purchase
        if ($request->has('verified_only') && $request->verified_only) {
            $query->where('is_verified_purchase', true);
        }

        // Search by product name or user name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                })->orWhere('comment', 'like', "%{$search}%");
            });
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Get summary stats
        $stats = [
            'total' => ProductReview::count(),
            'pending' => ProductReview::where('is_approved', false)->count(),
            'approved' => ProductReview::where('is_approved', true)->count(),
            'verified' => ProductReview::where('is_verified_purchase', true)->count(),
            'average_rating' => round(ProductReview::avg('rating'), 2),
        ];

        return response()->json([
            'reviews' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a review.
     */
    public function approve($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Review approved successfully',
            'review' => $review->load(['user', 'product']),
        ]);
    }

    /**
     * Reject/Delete a review.
     */
    public function reject($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->update(['is_approved' => false]);

        return response()->json([
            'message' => 'Review rejected',
            'review' => $review->load(['user', 'product']),
        ]);
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->update(['is_featured' => !$review->is_featured]);

        return response()->json([
            'message' => $review->is_featured ? 'Review featured' : 'Review unfeatured',
            'review' => $review->load(['user', 'product']),
        ]);
    }

    /**
     * Delete a review permanently.
     */
    public function destroy($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted permanently']);
    }

    /**
     * Bulk approve reviews.
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:product_reviews,id',
        ]);

        ProductReview::whereIn('id', $request->ids)
            ->update(['is_approved' => true]);

        return response()->json([
            'message' => count($request->ids) . ' reviews approved',
        ]);
    }

    /**
     * Bulk delete reviews.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:product_reviews,id',
        ]);

        ProductReview::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => count($request->ids) . ' reviews deleted',
        ]);
    }
}
