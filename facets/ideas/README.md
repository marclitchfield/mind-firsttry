# ideas facet
The ideas facet manipulates idea nodes in the mind. 

## Development

Install node, then run
```
npm install
```
 
Ensure that the mind-api is running at ```http://localhost:5000```. 
You can change this location with the ```MIND_API_URL``` environment variable.

To start the server and have it reload whenever files are changed, run
```
npm run server-watch
```

Before the facet can be used, it must be initialized. POST to the ```/api/init``` endpoint:
```
curl --fail --show-error --silent -XPOST http://localhost:9010/api/init
```

The server should now be available at ```http://localhost:9010```. 

The server will restart whenever a file is changed, or if it crashes. To reload 
the client assets whenever a change is made to files in the public folder, 
run this in a new console:
```
npm run webpack-watch
```
