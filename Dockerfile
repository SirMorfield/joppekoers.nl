FROM node:17-alpine

WORKDIR /app
# RUN chown -R node:node /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

EXPOSE 8080

USER node
ENTRYPOINT [ "npm", "run", "start" ]
