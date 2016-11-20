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

## Usage

Initialize the mind:
```
curl localhost:9051/init -XPOST -H "Content-Type: application/json"
```

(note: functionality specific to ideas will likely move into a facet api)

* Post an idea
```
curl localhost:9051/ideas -XPOST -H "Content-Type: application/json" -d '{ "body": "I think" }'
```
It outputs the xid generated for the idea, e.g. ```f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1```

* Post a related idea
```
curl localhost:9051/ideas -XPOST -H "Content-Type: application/json" -d '{ "subject": "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1", "predicate": "therefore", "body": "I am" }'
```

* Get an idea with predicates:
```
curl -g "localhost:9051/idea/f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1?p[]=therefore"
```
```
{
  me: {
    body: "I think",
    therefore: { body: "I am", _xid_: "160ddbcd-ac81-4de0-b055-d01555d1a59c" },
    _xid_: "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1"
  }
}
```

* Get all ideas linked to self:
```
curl localhost:9051/ideas
```
```
{
  me: {
    "has.idea": [
      { body: "I am", _xid_: "160ddbcd-ac81-4de0-b055-d01555d1a59c" },
      { body: "I think", _xid_: "f729e7bf-e7d2-4ea6-a3b5-dc815e8c54c1" }
    ]
  }
}
```
