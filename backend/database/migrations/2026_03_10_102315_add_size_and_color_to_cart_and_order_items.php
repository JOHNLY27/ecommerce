<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSizeAndColorToCartAndOrderItems extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('size')->nullable();
            $table->string('color')->nullable();
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('size')->nullable();
            $table->string('color')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn(['size', 'color']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['size', 'color']);
        });
    }
}
