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

Post a couple ideas:
```
curl localhost:9051/ideas -XPOST -H "Content-Type: application/json" -d '{ "body": "I think" }'
curl localhost:9051/ideas -XPOST -H "Content-Type: application/json" -d '{ "body": "I am" }'
```

Get the ideas:
```
curl localhost:9051/ideas
```

This should return
```
{
  me: {
    "has.idea": [
      { body: "I think", _xid_: "7553b208-2b0a-4bf2-a481-9f8b6e80df08" },
      { body: "I am", _xid_: "240e614f-a42b-4cb4-a5a0-80ce25070019" }
    ]
  }
}
```
