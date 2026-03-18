<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'product_id', 'variant_id', 'quantity', 'price', 'size', 'color'];

    /**
     * Get the order that owns this item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant associated with the order item.
     */
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
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
