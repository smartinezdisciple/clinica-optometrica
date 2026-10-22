# Stage 1: Build
# El contexto de build es la raíz del monorepo (para disponer del package-lock.json).
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm install --workspace=backend --include-workspace-root
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
RUN npm run build --workspace=backend

# Stage 2: Production
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm install --workspace=backend --omit=dev --include-workspace-root
COPY --from=builder /app/backend/dist ./backend/dist
EXPOSE 3000
CMD ["node", "backend/dist/app.js"]
