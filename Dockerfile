FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Install dependencies first (for better caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

# Copy source code
COPY . .

# Accept build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite React application
RUN pnpm build

# Production Stage - Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
