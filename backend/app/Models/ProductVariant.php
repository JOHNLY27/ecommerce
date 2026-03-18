<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'price',
        'stock_quantity',
        'image_url',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Get the product that owns the variant.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the effective price (variant price or parent product price).
     */
    public function getEffectivePriceAttribute()
    {
        return $this->price ?? $this->product->price;
    }

    /**
     * Get the display name (Product Name - Size - Color).
     */
    public function getDisplayNameAttribute()
    {
        $parts = [$this->product->name];
        if ($this->size) $parts[] = $this->size;
        if ($this->color) $parts[] = $this->color;
        return implode(' - ', $parts);
    }

    /**
     * Check if variant is in stock.
     */
    public function isInStock()
    {
        return $this->stock_quantity > 0 && $this->is_active;
    }

    /**
     * Get the image URL (variant image or parent product image).
     */
    public function getImageUrlAttribute()
    {
        return $this->attributes['image_url'] ?? $this->product->image_url;
    }

    /**
     * Scope to get only active variants.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get variants in stock.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0)->where('is_active', true);
    }
}
