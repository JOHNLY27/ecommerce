FROM php:8.1-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    default-mysql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy existing application directory contents
COPY . .

# Install dependencies bypassing strict lockfile checks
RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# Allow the script to run migrations or other commands
EXPOSE 8000

# Start Laravel's built-in web server and listen on Railway's dynamic PORT
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
