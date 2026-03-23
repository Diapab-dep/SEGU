# ── Stage 1: Build Frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build Backend ────────────────────────────────────────────────────
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 3: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Dependencias de producción únicamente
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Prisma client generado
COPY --from=backend-build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/schema.prisma ./prisma/schema.prisma

# Backend compilado
COPY --from=backend-build /app/dist ./dist

# Frontend compilado (servido como estáticos por Express)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
