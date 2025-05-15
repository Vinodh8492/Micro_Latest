# ---- Build Stage ----
    FROM node:20 AS build-stage
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install --legacy-peer-deps
    
    # Copy source & build
    COPY . .
    RUN npm run build
    
    
    # ---- Production Stage ----
    FROM nginx:stable-alpine AS production-stage
    
    # 1) Remove default static assets
    RUN rm -rf /usr/share/nginx/html/*
    
    # 2) Copy your production build from the build stage
    COPY --from=build-stage /app/dist/ /usr/share/nginx/html/
    
    # 3) Copy your custom nginx config (note: file is at ./nginx.conf in the context)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    