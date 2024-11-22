# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port that the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
