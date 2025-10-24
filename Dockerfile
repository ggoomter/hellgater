# Root Dockerfile for production build
FROM node:20-alpine AS base

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# ============================================
# Build stage for client
# ============================================
FROM base AS client-builder

WORKDIR /app/client

# Build client
RUN npm run build

# ============================================
# Build stage for server
# ============================================
FROM base AS server-builder

WORKDIR /app/server

# Generate Prisma Client
RUN npx prisma generate

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm install --production

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/prisma ./server/prisma
COPY --from=server-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=server-builder /app/shared ./shared

# Copy built client (will be served by server in production)
COPY --from=client-builder /app/client/dist ./client/dist

# Expose server port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start server
WORKDIR /app/server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
