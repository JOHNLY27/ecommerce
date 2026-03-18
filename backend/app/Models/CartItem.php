<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'variant_id', 'quantity', 'size', 'color'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant associated with the cart item.
     */
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Get the effective price for this cart item.
     */
    public function getEffectivePriceAttribute()
    {
        if ($this->variant) {
            return $this->variant->effective_price;
        }
        return $this->product->price;
    }

    /**
     * Get the subtotal for this cart item.
     */
    public function getSubtotalAttribute()
    {
        return $this->effective_price * $this->quantity;
    }

    /**
     * Get the display size (from variant or stored value).
     */
    public function getDisplaySizeAttribute()
    {
        return $this->variant ? $this->variant->size : $this->size;
    }

    /**
     * Get the display color (from variant or stored value).
     */
    public function getDisplayColorAttribute()
    {
        return $this->variant ? $this->variant->color : $this->color;
    }
}
