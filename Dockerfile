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
FROM oven/bun as builder-cms
WORKDIR /app/cmsj
COPY cmsj/package.json ./
RUN bun i

ENV NODE_ENV=production
COPY cmsj .
RUN bun run build
# RUN bun prune --omit=dev # not implemented yet

# =============== CMS ===============
FROM oven/bun as cms
RUN curl -fsSL https://bun.sh/install | bash
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder-cms /app/cmsj/src ./src
COPY --from=builder-cms /app/cmsj/node_modules ./node_modules
COPY --from=builder-cms /app/cmsj/package.json ./package.json
CMD bun run start

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
