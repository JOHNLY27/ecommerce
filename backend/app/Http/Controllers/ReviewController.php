<?php

namespace App\Http\Controllers;

use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product.
     */
    public function index(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $query = ProductReview::with('user')
            ->where('product_id', $productId)
            ->where('is_approved', true);

        // Filter by rating
        if ($request->has('rating') && in_array($request->rating, [1, 2, 3, 4, 5])) {
            $query->where('rating', $request->rating);
        }

        // Filter by verified purchase
        if ($request->has('verified_only') && $request->verified_only) {
            $query->where('is_verified_purchase', true);
        }

        // Filter by has images
        if ($request->has('with_images') && $request->with_images) {
            $query->whereNotNull('images');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'newest');
        switch ($sortBy) {
            case 'highest':
                $query->orderBy('rating', 'desc');
                break;
            case 'lowest':
                $query->orderBy('rating', 'asc');
                break;
            case 'helpful':
                $query->orderBy('helpful_count', 'desc');
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
        }

        $reviews = $query->paginate($request->get('per_page', 10));

        // Get rating summary
        $ratingSummary = [
            'average' => round(ProductReview::where('product_id', $productId)
                ->where('is_approved', true)
                ->avg('rating'), 1),
            'total' => ProductReview::where('product_id', $productId)
                ->where('is_approved', true)
                ->count(),
            'distribution' => [],
        ];

        // Get rating distribution
        for ($i = 5; $i >= 1; $i--) {
            $count = ProductReview::where('product_id', $productId)
                ->where('is_approved', true)
                ->where('rating', $i)
                ->count();
            $ratingSummary['distribution'][$i] = [
                'count' => $count,
                'percentage' => $ratingSummary['total'] > 0 
                    ? round(($count / $ratingSummary['total']) * 100, 1) 
                    : 0,
            ];
        }

        return response()->json([
            'reviews' => $reviews,
            'summary' => $ratingSummary,
        ]);
    }

    /**
     * Store a new review.
     */
    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|min:3|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'url',
        ]);

        // Check if user already reviewed this product
        $existingReview = ProductReview::where('product_id', $productId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this product.'
            ], 400);
        }

        // Check if this is a verified purchase
        $isVerified = ProductReview::hasUserPurchasedProduct(
            $request->user()->id,
            $productId
        );

        $review = ProductReview::create([
            'product_id' => $productId,
            'user_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? '',
            'images' => $validated['images'] ?? null,
            'is_verified_purchase' => $isVerified,
            'is_approved' => true, // Auto-approve for now
        ]);

        return response()->json([
            'message' => 'Review submitted successfully!',
            'review' => $review->load('user'),
        ], 201);
    }

    /**
     * Update a review.
     */
    public function update(Request $request, $productId, $reviewId)
    {
        $review = ProductReview::where('product_id', $productId)
            ->where('id', $reviewId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|min:3|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'url',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully!',
            'review' => $review->load('user'),
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(Request $request, $productId, $reviewId)
    {
        $review = ProductReview::where('product_id', $productId)
            ->where('id', $reviewId)
            ->firstOrFail();

        // Only allow owner or admin to delete
        if ($review->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    /**
     * Mark review as helpful.
     */
    public function markHelpful($productId, $reviewId)
    {
        $review = ProductReview::where('product_id', $productId)
            ->where('id', $reviewId)
            ->where('is_approved', true)
            ->firstOrFail();

        $review->increment('helpful_count');

        return response()->json([
            'message' => 'Thank you for your feedback!',
            'helpful_count' => $review->helpful_count,
        ]);
    }

    /**
     * Check if user can review this product.
     */
    public function canReview(Request $request, $productId)
    {
        $hasReviewed = ProductReview::where('product_id', $productId)
            ->where('user_id', $request->user()->id)
            ->exists();

        $hasPurchased = ProductReview::hasUserPurchasedProduct(
            $request->user()->id,
            $productId
        );

        return response()->json([
            'can_review' => !$hasReviewed,
            'has_reviewed' => $hasReviewed,
            'is_verified_purchase' => $hasPurchased,
        ]);
    }
}
