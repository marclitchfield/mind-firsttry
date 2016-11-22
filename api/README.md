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

To create a node, specify the relationship to 'self' in the url, and choose a valid type for the node with the 'is' predicate. 

```
curl localhost:9051/nodes/idea -XPOST -H "Content-Type: application/json" -d '{ 
  "is": "concept", 
  "body": "I think" 
}'
```
It outputs the xid generated for the idea, e.g. ```f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1```

Available types for the 'is' predicate:
* space
* concept
* event
* person
* object


### Post a related node

To create a node that is linked to another node, specify the subject node and the predicate that links the subject to the new node. The new node will be linked to 'self' with the relationship provided in the url.

```
curl localhost:9051/nodes/idea -XPOST -H "Content-Type: application/json" -d '{ 
  "subject": "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1", 
  "predicate": "therefore", 
  "is": "concept",
  "body": "I am" 
}'
```


### Get a node

To retrieve a node, post to the query endpoint with a json structure that describes the fields that should be returned.
In this example, the body is returned:
```
curl -g "localhost:9051/query/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" -XPOST -H "Content-Type: application/json" -d '{
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

You can also traverse predicates in the graph to select nodes, and the desired properties.

```
curl -g "localhost:9051/query/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" -XPOST -H "Content-Type: application/json" -d '{
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
curl localhost:9051/node/self/idea/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1 -XDELETE
```

The node should no longer appear in the results from ```curl localhost:9051/nodes/idea```
