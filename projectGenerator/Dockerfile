FROM ubuntu:latest


RUN apt-get update ;\
	apt-get install -y curl ;\
	curl -sL https://deb.nodesource.com/setup_20.x | bash - ;\
	apt-get install -y nodejs

RUN apt-get update ;\
	apt-get install -y imagemagick exiftool

ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci
RUN npm run build
COPY . .

CMD ["node", "build/index.js"]
