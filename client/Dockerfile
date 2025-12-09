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

# Expose port (default 8100)
EXPOSE ${CLIENT_PORT:-8100}

# Set working directory to client
WORKDIR /app/client

# Start Vite dev server with host flag (port is set in vite.config.ts to 3000)
# Use exec form to ensure proper signal handling and log output
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]
