# docker+postgres+express+mobx+react-Gym Tracker
This is a simple gym exercise tracking web-app with a dockerized postgres backend with an express REST API and a React+mobx frontend.

## Stack
- Docker
- PostgreSQL
- React
- MobX
- Express
- Node

## Executing
either run the `run.sh` file or run
	npm install --prefix ./client && npm run dist --prefix ./client/ && docker-compose build && docker-compose run

note: the client content must at the moment be manually updated by running `npm run dist`

the client side interface can be accessed at `localhost:8080`
## TODO :
- Automate client building through a Dockerfile
- Remove hardcoding for API access from client/src/.../App.js 
- add tests


***
* Samuel Askeli Feb 2020 *
