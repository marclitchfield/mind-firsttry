# mind-api
The mind api provides information for facets, and provides facilities for manipulating information in the substrates.

## Development

Install elixir, then run
```
mix local.hex --force
mix deps.get
mix compile
```

Ensure that the mind-db is running at ```http://localhost:8080```. 
You can change this location with the ```MIND_DGRAPH_URL``` environment variable.

To start the server, run
```
mix run --no-halt
```

Alternatively, start an IEx session:
```
iex -S mix
```

To run the tests, ensure the mind-db is running, and run:
```
mix test
```

## Usage

These steps outline how to interact with the mind-api using curl

### Initialize the mind
```
curl localhost:9051/init -XPOST -H "Content-Type: application/json"
```

### Post a node

To create a node, provide a source and predicate in the url, and properties in the payload. 
The 'is' property is the only required property for the new node. Try creating a node
that is linked to the built in 'self' node:

```
curl localhost:9051/nodes/self/root -XPOST -H "Content-Type: application/json" -d '{ 
  "is": "idea", 
  "body": "I think" 
}'
```
This creates a new node that is linked to 'self' by the 'root' predicate. 
It outputs the xid generated for the node, e.g. ```f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1```

### Post another node

Now try creating another node that is linked to the first node you created:

```
curl localhost:9051/nodes/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1/therefore -XPOST -H "Content-Type: application/json" -d '{
  "is": "idea",
  "body": "I am" 
}'
```


### Get a node

To retrieve a node, post to the query endpoint with a json structure that describes the fields that should be returned.
In this example, the body is returned:
```
curl "localhost:9051/query/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" -XPOST -H "Content-Type: application/json" -d '{
  "body": true
}'
```
```javascript
{
  me: {
    body: "I think"
    _xid_: "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1"
  }
}
```


### Get related nodes

You can also traverse predicates in the graph to select related nodes, and the desired properties.

```
curl "localhost:9051/query/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" -XPOST -H "Content-Type: application/json" -d '{
  "body": true,
  "therefore": {
    "body": true
  }
}'
```
```javascript
{
  me: {
    body: "I think",
    therefore: { body: "I am", _xid_: "160ddbcd-ac81-4de0-b055-d01555d1a59c" },
    _xid_: "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1"
  }
}
```

### Delete a relationship

To delete a relationship, send a DELETE with the subject, predicate, and object (S P O) triple to delete. 
(note: dgraph doesn't seem to have a node deletion capability... will research more)

```
curl localhost:9051/node/self/root/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1 -XDELETE
```

The node should no longer appear in the results from ```/query/self``` when querying with the 'root' predicate.


## fish functions

There are fish shell functions available in ```scripts/mind-commands.fsh``` that make
it easier to interact with the api from the command line. 

```
set xid (new_node self root idea "I think")
new_node $xid therefore idea "I am"
query_node $xid therefore
query_graph $xid '{ "body": true, "therefore": { "body": true } }'
delete_link self root $xid
```