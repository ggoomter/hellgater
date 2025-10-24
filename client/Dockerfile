# Client Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY client ./client
COPY shared ./shared

# Expose port
EXPOSE 3000

# Set working directory to client
WORKDIR /app/client

# Start Vite dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
