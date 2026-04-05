<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Add Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@primewear.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
        ]);

        // Add Customer
        User::create([
            'name' => 'John Customer',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Categories
        $men = Category::create(['name' => 'Men', 'description' => 'Men\'s Clothing']);
        $women = Category::create(['name' => 'Women', 'description' => 'Women\'s Clothing']);
        $accessories = Category::create(['name' => 'Accessories', 'description' => 'Fashion Accessories']);

        // Products
        Product::create([
            'name' => 'Classic White T-Shirt',
            'description' => 'Premium cotton white t-shirt.',
            'category_id' => $men->id,
            'subcategory' => 'Tops',
            'price' => 19.99,
            'stock_quantity' => 100,
            'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]);

        Product::create([
            'name' => 'Slim Fit Denim Jeans',
            'description' => 'Comfortable stretch denim jeans.',
            'category_id' => $men->id,
            'subcategory' => 'Bottoms',
            'price' => 49.99,
            'stock_quantity' => 50,
            'image_url' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]);

        Product::create([
            'name' => 'Floral Summer Dress',
            'description' => 'Lightweight floral dress for summer.',
            'category_id' => $women->id,
            'subcategory' => 'Tops',
            'price' => 39.99,
            'stock_quantity' => 30,
            'image_url' => 'https://images.unsplash.com/photo-1572804013309-82a89b4f9f28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]);

        Product::create([
            'name' => 'Leather Handbag',
            'description' => 'Spacious leather tote bag.',
            'category_id' => $accessories->id,
            'subcategory' => 'Women\'s',
            'price' => 89.99,
            'stock_quantity' => 15,
            'image_url' => 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]);
        
        Product::create([
            'name' => 'Classic Aviator Sunglasses',
            'description' => 'Polarized aviator sunglasses with gold frames.',
            'category_id' => $accessories->id,
            'subcategory' => 'Men\'s',
            'price' => 24.99,
            'stock_quantity' => 80,
            'image_url' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ]);
    }
}
