# =============== DEPS ==============
FROM node:18-alpine as dependencies
ENV NODE_ENV=production
WORKDIR /app
COPY shared ./shared
# ===================================


# ========= BUILDER BACKEND =========
FROM dependencies as builder-backend
ENV NODE_ENV=production
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend ./backend
RUN cd backend && npm run build
# ===================================


# ======== BUILDER FRONTEND =========
FROM dependencies as builder-frontend
ENV NODE_ENV=production
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run check
RUN cd frontend && npm run build
# ===================================



# ============= BACKEND =============
FROM gcr.io/distroless/nodejs18-debian11 as backend
ENV NODE_ENV=production
COPY --from=builder-backend /app/backend ./
EXPOSE 8080
CMD ["build/app.js"]
# ===================================



# ============= FRONTEND =============
FROM node:18-alpine as frontend
ENV NODE_ENV=production
COPY --from=builder-frontend /app/frontend/ ./
EXPOSE 3000
ENTRYPOINT [ "node", "build/index.js" ]
# ===================================
