# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package config files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend files
COPY . .

# Pass the build argument for the backend API URL (Vite embeds this at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Serve the built static files with Nginx
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
