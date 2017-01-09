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
You can change this location with the ```MIND_NEO4J_URL``` environment variable.

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

#### ```node_mutation```
Contains operations for how the node should be mutated. The following operations are supported:

* **props**: properties to set on the node. Value is a map of properties.
* **in**: links to create to this node. Value is a map of predicates and source node ids.
* **out**: links to create from this node. Value is a map of predicates and target node ids.
* **del**: props, outbound links, and inbound links to delete from this node. 

For example:

```javascript
{
  "props": { "a": "A", "b": "B" },
  "in": { "inbound": "source" },
  "out": { "outbound": "target" },
  "del": { 
    "props": { "c": "C" }, 
    "in": { "old_in": "source" }, 
    "out": { "old_out": "target" } 
  }
}
```
This example will do the following for the given node:

* Add or update ```a=A``` and ```b=B``` props to this node
* Add ```inbound``` link from ```source``` to this node
* Add ```outbound``` link from this node to ```target``` 
* Delete the property ```c``` with the value ```C```
* Delete ```old_in``` link from ```source``` to this node
* Delete ```old_out``` link from this node to ```target```

All operations are optional, and any combination can be provided.

#### ```graph_mutation``` 

Contains a map of node ids and corresponding ```node_mutation``` operations to be applied.

```javascript
{
  "id1": { /* node_mutation */ },
  "id2": { /* node_mutation */ }
}
```

#### ```query``` 
Specifies the data that should be returned from the graph. The query is a map with two types of values:

* When the value is true, a property selected for the given key.
* When the value is a map, a link is selected for the given key. Nested properties and links can be retrieved.

For example:

```javascript
{
  "prop1": true,
  "prop2": true,
  "child": {
    "prop3": true,
    "child": {
      "prop4": true
    }
  }
}
```

This will retrieve the following:
* The ```prop1``` and ```prop2``` properties for the node.
* Nodes related by the ```child``` predicate, along with the ```prop3``` property.
* Nodes related to the children by the ```child``` predicate (the grandchildren), along with the ```prop4``` property.
* Built-in properties like ```id``` and ```created``` for each node


## Usage

To interact with the mind-api from the command line, there are fish shell commands available in ```scripts/commands.fish```.
These commands are simple wrappers around curl, and are not required for making calls to the mind-api. 

#### new_node
To create a new node with properties, using the "props" operation:

```fish
set node1 (new_node '{ "props": { "body": "I think" }}')
query_graph $node1 '{ "body": true }'
```
```
{"id": "cab672fd-0439-4acd-bf9a-8114d24a9553", "body": "I think"}⏎
```

To create another node and link it to the first using the "in" operation:

```fish
set node2 (new_node '{ "props": { "body": "I am" }, "in": { "reason": "'$node1'" } }')
query_graph $node1 '{ "body": true, "reason": { "body": true } }'
```
```
{
  id: "cab672fd-0439-4acd-bf9a-8114d24a9553",
  body: "I think",
  therefore: [{ id: "60a98113-2c25-4783-968f-008e4b072d65", body: "I am" }]
}
```

#### mutate_node
To mutate an existing node using the "out" operation":

```fish
mutate_node $node2 '{ "out": { "parent": "'$node1'" } }'
query_graph $node2 '{ "body": true, "parent": { "body": true } }'
```
```
{
  id: "60a98113-2c25-4783-968f-008e4b072d65",
  body: "I am",
  parent: [{ id: "cab672fd-0439-4acd-bf9a-8114d24a9553", body: "I think" }]
}
```

#### mutate_graph
To mutate multiple nodes:

```fish
mutate_graph '{ 
  "'$node1'": { "props": { "confidence": "81" } }, 
  "'$node2'": { "props": { "confidence": "95" } } 
}'
query_graph $node1 '{ "body": true, "confidence": true, 
  "therefore": { "body": true, "confidence": true } }'
```
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

#### del operation
To delete links between nodes, you can use either mutate function with a ```del``` operation. 
The ```del``` operation accepts any combination of ```props```, ```in```, or ```out``` operations. 

```fish
mutate_node $node2 '{ "del": { "out": { "parent": "'$node1'" } } }'
query_graph $node2 '{ "body": true, "parent": { "body": true } }'
```
```
{"id":"60a98113-2c25-4783-968f-008e4b072d65","body":"I am"}
```

