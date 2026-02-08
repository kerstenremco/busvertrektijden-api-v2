## Docker

`docker run --name busvertrektijden-dev-pg -e POSTGRES_USER=bustijden -e POSTGRES_PASSWORD=bustijden -p 5432:5432 -d postgres:18.1`

`docker run --name busvertrektijden-dev-redis -p 6379:6379 -d redis:8.4`
