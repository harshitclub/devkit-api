# Use official Node.js lightweight Alpine image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Copy package manifests first for optimal caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY server.js ./
COPY src/ ./src/

# Run as non-root node user for container security
USER node

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the NodeFrame application
CMD ["node", "server.js"]
