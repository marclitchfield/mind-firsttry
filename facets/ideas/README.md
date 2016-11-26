# ideas facet
The ideas facet manipulates idea nodes in the mind. 

## Development

Install node, then run
```
npm install
npm install -g webpack
```

Ensure that the mind-api is running at ```http://localhost:5000```. 
You can change this location with the ```MIND_API_URL``` environment variable.

To start the server, run
```
npm start
```

The server should now be available at ```http://localhost:9010```

To reload the server whenever a code change is made, run this in a new console:
```
webpack --watch
```

## Fish commands

To interact with the facet via the command line, try these commands from ```../../api/scripts/commands.fish```:

```fish
set idea1 (new_node facets.idea root.idea idea "I think")
set idea2 (new_node $idea1 therefore idea "I am")
set idea3 (new_node facets.idea root.idea idea "Socrates is mortal")
```
