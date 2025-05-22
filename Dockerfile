# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy the built app from the build stage
COPY --from=build /app/.output/public /usr/share/nginx/html

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates
COPY my.sundra.io.pem /etc/nginx/ssl/sundra.io.pem
COPY my.sundra.io-key.pem /etc/nginx/ssl/sundra.io-key.pem

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
