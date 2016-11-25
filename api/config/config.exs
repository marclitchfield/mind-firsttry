use Mix.Config

config :api, cowboy_port: 9000
config :api, dgraph_url: System.get_env("MIND_DGRAPH_URL") || "http://localhost:8080"
