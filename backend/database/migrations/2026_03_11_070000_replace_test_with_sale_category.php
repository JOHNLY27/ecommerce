<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReplaceTestWithSaleCategory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // If a category named TEST exists, either rename it to SALE or move its products to existing SALE and delete TEST
        $test = DB::table('categories')->where('name', 'TEST')->first();
        $sale = DB::table('categories')->where('name', 'SALE')->first();

        if ($test) {
            if ($sale) {
                // Re-assign products from TEST to existing SALE, then remove TEST
                DB::table('products')->where('category_id', $test->id)->update(['category_id' => $sale->id]);
                DB::table('categories')->where('id', $test->id)->delete();
            } else {
                // Rename TEST to SALE so existing product links remain valid
                DB::table('categories')->where('id', $test->id)->update(['name' => 'SALE', 'updated_at' => now()]);
            }
        } else {
            // No TEST found; ensure SALE exists
            if (!$sale) {
                DB::table('categories')->insert([
                    'name' => 'SALE',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Attempt to revert: if SALE exists and TEST does not, rename SALE back to TEST
        $sale = DB::table('categories')->where('name', 'SALE')->first();
        $test = DB::table('categories')->where('name', 'TEST')->first();

        if ($sale && !$test) {
            DB::table('categories')->where('id', $sale->id)->update(['name' => 'TEST', 'updated_at' => now()]);
        }
    }
}
