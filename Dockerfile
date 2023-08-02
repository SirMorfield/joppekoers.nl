# =============== DEPS ==============
FROM node:18-alpine as dependencies
WORKDIR /app

COPY shared ./shared

# ==== BUILDER PROJECT GENERATOR ====
FROM dependencies as builder-project-generator
ENV NODE_ENV=production
WORKDIR /app

RUN apk --update --no-cache add imagemagick exiftool

COPY projectGenerator/package*.json ./projectGenerator/
RUN cd projectGenerator && npm ci
COPY projectGenerator ./projectGenerator
RUN cd projectGenerator && npm run lint:check
RUN cd projectGenerator && npm run build

# ======== BUILDER FRONTEND =========
FROM dependencies as builder-frontend
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend

ENV NODE_ENV=production
RUN cd frontend && npm run check
RUN cd frontend && npm run lint:check
RUN cd frontend && npm run build

RUN cd frontend && npm prune --omit=dev

# ========== BUILDER CMS ============
FROM node:18-alpine as builder-cms
WORKDIR /app/cmsj
COPY cmsj/package.json cmsj/package-lock.json ./
RUN npm ci

ENV NODE_ENV=production
COPY cmsj .
RUN npm run build
RUN npm prune --omit=dev

# =============== CMS ===============
FROM gcr.io/distroless/nodejs:18 as cms
WORKDIR /app
COPY --from=builder-cms /app/cmsj/build ./build
COPY --from=builder-cms /app/cmsj/node_modules ./node_modules
COPY --from=builder-cms /app/cmsj/package.json ./package.json
CMD [ "./build/app.js" ]

# ======== PROJECT GENERATOR ========
FROM builder-project-generator as project-generator
ENV NODE_ENV=production
WORKDIR /app

CMD cd projectGenerator && npm run start

# ============= FRONTEND =============
FROM gcr.io/distroless/nodejs:18 as frontend
# FROM node:18-alpine as frontend

ENV NODE_ENV=production
WORKDIR /app
ENV PORT=8080

COPY --from=builder-frontend /app/frontend/build ./build
COPY --from=builder-frontend /app/frontend/node_modules ./node_modules
COPY --from=builder-frontend /app/frontend/package.json ./package.json

# ENTRYPOINT [ "node" ]
CMD [ "./build/index.js" ]
