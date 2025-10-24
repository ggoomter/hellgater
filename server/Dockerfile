# Server Dockerfile
FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY server ./server
COPY shared ./shared

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Set working directory back to app root
WORKDIR /app

# Start command will be in docker-compose
CMD ["sh", "-c", "cd server && npm run dev"]
