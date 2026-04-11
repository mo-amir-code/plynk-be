# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package file
COPY package.json ./

# Install dependencies (fresh, without lockfile)
RUN npm install

# Copy source code
COPY . .

# Build-only Prisma vars (override via --build-arg if needed)
ARG DIRECT_URL
ENV DIRECT_URL=$DIRECT_URL

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy package file
COPY package.json ./

# Install only production dependencies (fresh, without lockfile)
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema and migrations
COPY prisma ./prisma

# Runtime mode (prevents pino-pretty transport in container)
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/server.js"]
