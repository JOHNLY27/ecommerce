<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $table = 'payment_methods';

    protected $fillable = [
        'cod_enabled',
        'gcash_enabled',
    ];

    protected $casts = [
        'cod_enabled' => 'boolean',
        'gcash_enabled' => 'boolean',
    ];
}
