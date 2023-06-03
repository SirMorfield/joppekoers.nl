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
RUN cd frontend && npm run svelte-sync
RUN cd frontend && npm run lint:check
RUN cd frontend && npm run build

RUN cd frontend && npm prune --production
RUN rm -rf frontend/static \
	rm -rf frontend/src/assets

# ======== PROJECT GENERATOR ========
FROM builder-project-generator as project-generator
ENV NODE_ENV=production
WORKDIR /app

CMD cd projectGenerator && npm run start

# ============= FRONTEND =============
FROM node:18-alpine as frontend
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder-frontend /app/frontend/ ./
ENV PORT=8080
ENTRYPOINT [ "npm", "start" ]
