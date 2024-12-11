# Use the official PHP image as the base
FROM php:latest

# Install required extensions for MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Set up working directory in the container
WORKDIR /var/www/html

# Copy application files to the working directory
COPY . /var/www/html

# Set environment variables for the development server
# Replace "db" with your database container name
ENV DB_HOST=joo0kc8o40kgsscws8w8c0s0.5.253.247.243.sslip.io
ENV DB_PORT=3306
ENV DB_NAME=promptbook
ENV DB_USER=bit_academy
ENV DB_PASS=bit_academy

# Open port 8000 for the development server
EXPOSE 8000

# Start the PHP development server
CMD ["php", "-S", "0.0.0.0:8000", "src/router.php"]
