defmodule Api do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    port = Application.get_env(:api, :cowboy_port, 9000)
    children = [
      Plug.Adapters.Cowboy.child_spec(:http, MindRouter, [], [port: port])
    ]
 
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    response = Supervisor.start_link(children, opts)

    IO.puts("mind-api listening on port #{port}")
    response
  end

end
