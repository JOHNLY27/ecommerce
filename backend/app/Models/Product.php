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
}
