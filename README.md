# mind

## Installation

Install docker-compose, then run
```
docker-compose up -d
```

## Containers

Run ```docker ps``` to verify that the following containers are running. 
You should be able to access them from the host at ```http://localhost:<external-port>```.

| Container         | External Port | Internal Port | Description                   |
| :---------------- | ------------- | ------------- | :---------------------------- |
| mind-api          | 5000          | 9000          | core json api                 |
| mind-db           | 5008          | 8080          | dgraph database server        |
| mind-facets.ideas | 5010          | 9010          | ideas facet, web application  |

To check the logs for a container, run ```docker logs <container_name>```.

Note that the logs will show the internal ports within the container.
To access services from the host, use the external ports defined in the table above.
