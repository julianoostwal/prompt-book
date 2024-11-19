# Use the official MySQL image as the base
FROM mysql:latest

# Set environment variables for MySQL setup
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=promptbook
ENV MYSQL_USER=bit_academy
ENV MYSQL_PASSWORD=bit_academy

# Copy the SQL file into the initialization directory
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Set MySQL configuration options
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
