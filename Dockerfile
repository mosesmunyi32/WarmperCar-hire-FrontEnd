# Build stage: install dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (with lock file for consistency)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage: run the built app
FROM node:20-alpine AS runner
WORKDIR /app

# Set to production mode
ENV NODE_ENV=production

# Copy the built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
