# =============== DEPS ==============
FROM oven/bun as dependencies
WORKDIR /app

COPY shared ./shared

# ==== BUILDER PROJECT GENERATOR ====
FROM dependencies as builder-project-generator
ENV NODE_ENV=production
WORKDIR /app/projectGenerator
COPY projectGenerator/package.json ./
RUN bun i
COPY projectGenerator ./
# RUN bun run lint:check # TODO: enable
RUN bun run build

# ======== BUILDER FRONTEND =========
FROM dependencies as builder-frontend
WORKDIR /app

COPY frontend/package.json ./frontend/
WORKDIR /app/frontend
RUN bun install
COPY frontend ./

ENV NODE_ENV=production
RUN bun run check
# RUN bun run lint:check # TODO: enable
RUN bun run build

# RUN bun prune --omit=dev # not implemented yet

# ========== BUILDER CMS ============
FROM node:18-alpine as builder-cms
WORKDIR /app/cmsj
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev
COPY cmsj/package.json cmsj/package-lock.json ./
RUN npm ci

ENV NODE_ENV=production
COPY cmsj .
RUN npm run build
RUN npm prune --omit=dev

# =============== CMS ===============
FROM node:18-alpine as cms
RUN apk --no-cache add libpng librsvg libgsf giflib libjpeg-turbo musl vips-dev fftw-dev build-base gcc autoconf automake zlib-dev libpng-dev
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder-cms /app/cmsj/build ./build
COPY --from=builder-cms /app/cmsj/node_modules ./node_modules
COPY --from=builder-cms /app/cmsj/package.json ./package.json
CMD node ./build/app.js

# ======== PROJECT GENERATOR ========
FROM builder-project-generator as project-generator
ENV NODE_ENV=production
WORKDIR /app/projectGenerator
CMD bun run start

# ============= FRONTEND =============
FROM oven/bun as frontend

ENV NODE_ENV=production
WORKDIR /app
ENV PORT=8080

COPY --from=builder-frontend /app/frontend/build ./build
COPY --from=builder-frontend /app/frontend/node_modules ./node_modules
COPY --from=builder-frontend /app/frontend/package.json ./package.json

CMD bun run start
