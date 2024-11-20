# Using containers localy

## api

From `/api` folder.

```bash
docker stop deep_dive_api_container
docker rm deep_dive_api_container
docker build -t deep_dive_api .
docker run -d -p 8000:8000 --link deep_dive_database_container:db --name deep_dive_api_container deep_dive_api
```

## database

From the `/database` folder.

```bash
docker stop deep_dive_database_container
docker rm deep_dive_database_container
docker build -t deep_dive_database .
docker run -d -p 3306:3306 --name deep_dive_database_container deep_dive_database
```

```bash
docker run --name phpmyadmin -d --link deep_dive_database_container:db -p 8082:80 phpmyadmin
```