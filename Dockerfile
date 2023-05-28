# =============== DEPS ==============
FROM node:18-alpine as dependencies
WORKDIR /app
COPY shared ./shared
# ===================================


# ==== BUILDER PROJECT GENERATOR ====
FROM dependencies as builder-project-generator
ENV NODE_ENV=production

RUN apk --update --no-cache add imagemagick exiftool

COPY projectGenerator/package*.json ./projectGenerator/
RUN cd projectGenerator && npm ci
COPY projectGenerator ./projectGenerator
RUN cd projectGenerator && npm run lint:check
RUN cd projectGenerator && npm run build
# ===================================


# ======== BUILDER FRONTEND =========
FROM dependencies as builder-frontend
ENV NODE_ENV=production
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
# RUN cd frontend && npm run lint:check # TODO: enable
RUN cd frontend && npm run svelte-sync
RUN cd frontend && npm run build
# ===================================


# ======== PROJECT GENERATOR ========
FROM builder-project-generator as project-generator
ENV NODE_ENV=production
CMD cd projectGenerator && npm run start
# ===================================



# ============= FRONTEND =============
FROM node:18-alpine as frontend
COPY --from=builder-frontend /app/frontend/ ./
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT [ "node", "build/index.js" ]
# ===================================
