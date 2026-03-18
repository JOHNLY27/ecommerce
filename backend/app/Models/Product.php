<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'price', 'stock_quantity', 'category_id', 'image_url', 'sizes', 'colors', 'is_new_arrival', 'is_sale'];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
        'is_new_arrival' => 'boolean',
        'is_sale' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all variants for the product.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get active variants for the product.
     */
    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    /**
     * Check if product has variants.
     */
    public function hasVariants()
    {
        return $this->variants()->count() > 0;
    }

    /**
     * Get total stock (sum of all variants or own stock).
     */
    public function getTotalStockAttribute()
    {
        if ($this->hasVariants()) {
            return $this->variants()->sum('stock_quantity');
        }
        return $this->stock_quantity;
    }

    /**
     * Get available sizes from variants.
     */
    public function getAvailableSizesAttribute()
    {
        if ($this->hasVariants()) {
            return $this->variants()
                ->where('is_active', true)
                ->whereNotNull('size')
                ->distinct()
                ->pluck('size')
                ->toArray();
        }
        return $this->sizes ?? [];
    }

    /**
     * Get available colors from variants.
     */
    public function getAvailableColorsAttribute()
    {
        if ($this->hasVariants()) {
            return $this->variants()
                ->where('is_active', true)
                ->whereNotNull('color')
                ->distinct()
                ->pluck('color')
                ->toArray();
        }
        return $this->colors ?? [];
    }

    /**
     * Get all reviews for the product.
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Get approved reviews for the product.
     */
    public function approvedReviews()
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    /**
     * Get average rating for the product.
     */
    public function getAverageRatingAttribute()
    {
        return round($this->approvedReviews()->avg('rating') ?? 0, 1);
    }

    /**
     * Get total reviews count.
     */
    public function getReviewsCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    /**
     * Get rating distribution.
     */
    public function getRatingDistributionAttribute()
    {
        $distribution = [];
        $total = $this->reviews_count;

        for ($i = 5; $i >= 1; $i--) {
            $count = $this->approvedReviews()->where('rating', $i)->count();
            $distribution[$i] = [
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
            ];
        }

        return $distribution;
    }
}
