FROM node:lts

WORKDIR /home/node/
EXPOSE 8080

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g typescript
RUN tsc

ENTRYPOINT [ "npm", "run", "start" ]
