# ============== DEPS ===============
FROM node:18-alpine as dependencies
WORKDIR /app

# ========== BUILDER MAIN ===========
FROM dependencies as builder-main
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run lint:check
# RUN npm run test # TODO: enable

ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

# =============== MAIN ===============
FROM gcr.io/distroless/nodejs:18 as main
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder-main /app/package.json ./
COPY --from=builder-main /app/node_modules ./node_modules
COPY --from=builder-main /app/build ./build

CMD [ "build/app.js" ]
