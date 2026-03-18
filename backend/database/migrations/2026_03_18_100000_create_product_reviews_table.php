<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('rating')->comment('1-5 stars');
            $table->string('title')->nullable();
            $table->text('comment');
            $table->json('images')->nullable()->comment('Array of image URLs');
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(true)->comment('Auto-approve or require moderation');
            $table->boolean('is_featured')->default(false)->comment('Featured review shown prominently');
            $table->unsignedInteger('helpful_count')->default(0)->comment('Number of helpful votes');
            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'is_approved']);
            $table->index(['product_id', 'rating']);
            $table->unique(['product_id', 'user_id'], 'product_user_review_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_reviews');
    }
}
