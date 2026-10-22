# Stage 1: Build
# El contexto de build es la raíz del monorepo (para disponer del package-lock.json).
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm install --workspace=frontend --include-workspace-root
COPY frontend/ ./frontend/
RUN npm run build --workspace=frontend

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
