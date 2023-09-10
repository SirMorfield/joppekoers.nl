# [joppekoers.nl](https://joppekoers.nl)

My very first deployed project with the goal of learning webdev

Tech learned in chronological order

- git
- Javascript
- NodeJS
- Express
- EJS
- Linux servers
- Docker (compose)
- TypeScript
- ESLint & Prettier
- SvelteKit
- GitHub actions
- Watchtower
- Bun

## Usage

```shell
cd frontend
npm i
npm run dev
# other terminal
cd cmsj
npm i
npm run dev
```

Or via docker compose

```
docker compose up --build
```

# Production

When running the cms behind a NGINX reverse proxy use:
source: https://docs.strapi.io/dev-docs/data-management/transfer

```nginx
server {
	listen 80;
	server_name <yourdomain>;
	location / {
		proxy_pass http://localhost:1337;
		proxy_pass http://cms:1337/;

		# https://docs.strapi.io/dev-docs/data-management/transfer
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "Upgrade";
		proxy_set_header Host $host;


		# https://stackoverflow.com/questions/42589781
		# The below is equivalent to "include proxy_params;"
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```
