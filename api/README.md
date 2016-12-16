# mind-api
The mind api provides information for facets, and provides facilities for manipulating information in the substrates.

## Development

Install elixir, then run
```
mix local.hex --force
mix deps.get
mix compile
```

Ensure that the mind-db is running at ```http://localhost:5008```. 
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

## API

The API exposes the following endpoints

| verb | endpoint    | payload format       | description                | fish command       |
| :--- | :---------- | :------------------- | :------------------------- | :----------------- |
| POST | /node       | ```node_mutation```  | creates a new node         | ```new_node```     |
| POST | /node/:id   | ```node_mutation```  | mutates a node             | ```mutate_node```  |
| POST | /graph      | ```graph_mutation``` | mutates multiple nodes     | ```mutate_graph``` |
| POST | /query      | ```query```          | queries the graph          | ```query_graph```  |

### Payload formats

The ```node_mutation``` format has the following keys:

* **props**: properties to set on the node. Value is a map of properties.
* **in**: links to create to this node. Value is a map of predicates and source node ids.
* **out**: links to create from this node. Value is a map of predicates and target node ids.
* **del**: outbound links to delete from this node. Value is a map of predicates and target node ids.

The ```graph_mutation``` format is a map, where the keys are the node ids to mutate, and the value is a ```node_mutation```. 

The ```query_mutation``` is a map of the properties or links to be retrieved. The value controls whether
or property or a link is selected for the given key. 

* When the value is true, a property selected for the given key.
* When the value is a map, a link is selected for the given key.


## Usage

To interact with the mind-api from the command line, there are fish shell commands available in ```scripts/commands.fish```.
These commands are simple wrappers around curl, and are not required for making calls to the mind-api. 

To create a new node with properties, using the "props" operation:

```fish
set node1 (new_node '{ "props": { "body": "I think" }}')
query_graph $node1 '{ "body": true }'
```
Returns
```
{"id": "cab672fd-0439-4acd-bf9a-8114d24a9553", "body": "I think"}⏎
```

To create another node and link it to the first using the "in" operation:

```fish
set node2 (new_node '{ "props": { "body": "I am" }, "in": { "reason": "'$node1'" } }')
query_graph $node1 '{ "body": true, "reason": { "body": true } }'
```
Returns
```
{
  id: "cab672fd-0439-4acd-bf9a-8114d24a9553",
  body: "I think",
  therefore: [{ id: "60a98113-2c25-4783-968f-008e4b072d65", body: "I am" }]
}
```

To mutate an existing node using the "out" operation":

```fish
mutate_node $node2 '{ "out": { "parent": "'$node1'" } }'
query_graph $node2 '{ "body": true, "parent": { "body": true } }'
```
Returns
```
{
  id: "60a98113-2c25-4783-968f-008e4b072d65",
  body: "I am",
  parent: [{ id: "cab672fd-0439-4acd-bf9a-8114d24a9553", body: "I think" }]
}
```

To mutate multiple nodes:

```fish
mutate_graph '{ "'$node1'": { "props": { "confidence": "81" } }, "'$node2'": { "props": { "confidence": "95" } } }'
query_graph $node1 '{ "body": true, "confidence": true, "therefore": { "body": true, "confidence": true } }'
```
Returns
```
{
  id: "cab672fd-0439-4acd-bf9a-8114d24a9553",
  body: "I think",
  confidence: "81"
  therefore: [
    {
      id: "60a98113-2c25-4783-968f-008e4b072d65",
      body: "I am",
      confidence: "95"
    }
  ],
}
```

To delete links between nodes, you can use either mutate function with a "del" operation. 

```fish
mutate_node $node2 '{ "del": { "parent": "'$node1'" } }'
query_graph $node2 '{ "body": true, "parent": { "body": true } }'
```
Returns
```
{"id":"60a98113-2c25-4783-968f-008e4b072d65","body":"I am"}
```

