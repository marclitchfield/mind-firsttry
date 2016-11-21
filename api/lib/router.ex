defmodule MindRouter do
  @properties ~w(_xid_ body)
  
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/nodes/:predicate" do
    {:ok, nodes} = MindRepo.get_nodes(:self, @properties, [predicate], conn.params["p"] || [])
    send_resp(conn, 200, nodes |> Poison.encode!)
  end

  get "/node/:id" do
    {:ok, node} = MindRepo.get_nodes(id, @properties, conn.params["p"] || [])
    send_resp(conn, 200, node |> Poison.encode!)
  end

  # TODO: Clean this up, it's getting long.
  post "/nodes/:predicate" do
    {predicate, type, body} = {predicate, conn.params["type"], conn.params["body"]}
    case MindRepo.new_node(:self, predicate, type, body) do
      {:ok, id} -> 
        case {conn.params["subject"], conn.params["predicate"]} do
          {nil, _} -> :ok
          {subject, subject_predicate} -> :ok = MindRepo.link_nodes(subject, subject_predicate, id)
        end
        send_resp(conn, 200, id)
      {:error, :invalid_type, type} ->
        send_resp(conn, 400, "Invalid type: #{type}")
    end
  end

  post "/init" do
    :ok = MindRepo.initialize()
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

end
