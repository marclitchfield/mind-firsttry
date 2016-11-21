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

**Initialize the mind**
```
curl localhost:9051/init -XPOST -H "Content-Type: application/json"
```

**Post an idea**

```
curl localhost:9051/nodes/idea -XPOST -H "Content-Type: application/json" -d '{ "type": "concept", "body": "I think" }'
```
It outputs the xid generated for the idea, e.g. ```f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1```


**Post a related idea**

```
curl localhost:9051/nodes/idea -XPOST -H "Content-Type: application/json" -d '{ 
  "subject": "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1", 
  "predicate": "therefore", 
  "type": "concept",
  "body": "I am" 
}'
```


**Get an idea with predicates**

```
curl -g "localhost:9051/node/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1?p[]=therefore"
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


**Get all ideas linked to self**

```
curl localhost:9051/nodes/idea
```
```javascript
{
  me: {
    "has.idea": [
      { body: "I am", _xid_: "160ddbcd-ac81-4de0-b055-d01555d1a59c" },
      { body: "I think", _xid_: "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" }
    ]
  }
}
```
