FROM node:18-alpine

WORKDIR /app
# RUN chown -R node:node /app

COPY frontend/package.json  frontend/package-lock.json ./frontend/
RUN cd frontend && npm install
COPY backend/package.json  backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY . .

RUN cd frontend && npm run build
RUN cd backend && npm run build

EXPOSE 8080

USER node
ENTRYPOINT [ "npm", "run", "start" ]
