# Server Dockerfile (Development)
FROM node:20-alpine

# Install openssl for Prisma and wget for health check
RUN apk add --no-cache openssl wget

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

# Copy entrypoint script
COPY server/scripts/docker-entrypoint.sh /app/server/scripts/docker-entrypoint.sh
RUN chmod +x /app/server/scripts/docker-entrypoint.sh

# Expose port (default 8200)
EXPOSE ${PORT:-8200}

# Set working directory back to app root
WORKDIR /app

# Health check (uses PORT env var, defaults to 8200)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8200}/health || exit 1

# Start command will be in docker-compose (with auto-migration)
CMD ["sh", "-c", "cd /app/server && npm run dev"]
