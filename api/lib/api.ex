defmodule Api do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    port = Application.get_env(:api, :cowboy_port, 5000)
    children = [
      Plug.Adapters.Cowboy.child_spec(:http, MindRouter, [], [port: port])
    ]
 
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
