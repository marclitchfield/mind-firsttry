use Mix.Config

config :api, cowboy_port: 9000
config :api, dgraph_url: System.get_env("MIND_DGRAPH_URL") || "http://localhost:5008"

config :api, elastic_index: "mind"
config :api, elastic_url: System.get_env("MIND_SEARCH_URL") || "http://localhost:5007"