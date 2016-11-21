# mind

## Installation

Install docker-compose, then run
```
docker-compose up -d
```

Run ```docker ps``` to verify that the mind-db and mind-api containers are running. 

The api should now be available at ```http://localhost:5000```

To check the logs, run
```
docker logs mind-db
docker logs mind-api
```
