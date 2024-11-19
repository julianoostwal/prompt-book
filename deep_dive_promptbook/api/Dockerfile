# Use the official PHP image as the base
FROM php:latest

# Install required extensions for MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Set up working directory in the container
WORKDIR /var/www/html

# Copy application files to the working directory
COPY . /var/www/html

# Set environment variables for the development server
ENV DB_HOST=db
ENV DB_NAME=promptbook
ENV DB_USER=bit_academy
ENV DB_PASS=bit_academy

# Open port 8000 for the development server
EXPOSE 8000

# Start the PHP development server
CMD ["php", "-S", "0.0.0.0:8000", "src/router.php"]
