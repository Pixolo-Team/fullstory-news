# syntax=docker/dockerfile:1

# --- Build stage -------------------------------------------------------------
# Needs devDependencies (@nestjs/cli, typescript, tsc-alias) to compile.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN npm run build

# --- Dependency stage --------------------------------------------------------
# A separate prod-only install keeps the compiler toolchain out of the runtime.
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Runtime stage -----------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Cloud Run injects its own PORT; this is the fallback for a plain docker run.
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# node:alpine ships an unprivileged `node` user; the app never writes to disk.
USER node

EXPOSE 8080

CMD ["node", "dist/main.js"]
