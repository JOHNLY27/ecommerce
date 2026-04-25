<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'total_amount', 'status', 'payment_method', 'address', 'contact', 'city', 'received_at', 'customer_note'];

    protected $casts = [
        'received_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Check if order can be marked as received.
     */
    public function canBeReceived()
    {
        return $this->status === 'completed' && !$this->received_at;
    }

    /**
     * Check if order has been received.
     */
    public function isReceived()
    {
        return !is_null($this->received_at);
    }

    /**
     * Check if order can be reviewed.
     */
    public function canBeReviewed()
    {
        return $this->status === 'completed' && $this->received_at;
    }

    /**
     * Get products that haven't been reviewed by the user.
     */
    public function getUnreviewedProducts()
    {
        $productIds = $this->items()->pluck('product_id')->unique();
        
        $reviewedProductIds = ProductReview::where('user_id', $this->user_id)
            ->whereIn('product_id', $productIds)
            ->pluck('product_id');

        return Product::whereIn('id', $productIds)
            ->whereNotIn('id', $reviewedProductIds)
            ->get();
    }
}
