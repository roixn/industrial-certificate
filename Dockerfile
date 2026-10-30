# Multi-stage production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies and build frontend
RUN npm install
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy root manifest and install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy backend code and built frontend distribution
COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5001

# Start the full-stack server
CMD ["node", "backend/src/server.js"]
