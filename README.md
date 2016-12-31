# mind

## Installation

Install docker-compose, then run
```
docker-compose up -d
```

## Containers

Run ```docker ps``` to verify that the following containers are running. 

You should be able to access them from the host at ```http://localhost:<external-port>```.

| Container                           | External Port | Internal Port | Description                   |
| :---------------------------------- | ------------- | ------------- | :---------------------------- |
| [mind-api](./api)                   | 5000          | 9000          | core json api                 |
| mind-db                             | 5008          | 8080          | dgraph database server        |
| mind-search                         | 5007          | 9200          | elastic search server         |
| [mind-facet.ideas](./facets/ideas)  | 5010          | 9010          | ideas facet, web application  |
To check the logs for a container, run ```docker logs <container_name>```.

To follow all logs, run ```docker-compose logs -f```

Note that the logs will show the internal ports within the container.

To access services from the host, use the external ports defined in the table above.

## Initialization

Before the ideas facet can be used, it must be initialized. Eventually this will be an automatic operation. For now, POST to the /api/init endpoint:

```
curl --fail --show-error --silent -XPOST http://localhost:5010/api/init
```

The facet should now be available on port ```5010```
