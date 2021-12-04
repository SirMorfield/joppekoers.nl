FROM node:16
WORKDIR /app
EXPOSE 8080
CMD npm install && \
	npm run build && \
	npm run start
