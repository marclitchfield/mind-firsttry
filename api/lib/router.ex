defmodule MindRouter do
  @properties ~w(_xid_ body)
  
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  # TODO: validate input predicates
  get "/ideas" do
    {:ok, ideas} = MindRepo.get_nodes(:self, @properties, ~w(has.idea), conn.params["p"])
    send_resp(conn, 200, ideas |> Poison.encode!)
  end

  get "/idea/:id" do
    {:ok, idea} = MindRepo.get_nodes(id, @properties, conn.params["p"])
    send_resp(conn, 200, idea |> Poison.encode!)
  end

  post "/ideas" do
    {:ok, id} = MindRepo.new_node(:self, "has.idea", :concept, conn.params["body"])
    case {conn.params["subject"], conn.params["predicate"]} do
      {nil, _} -> :ok
      {subject, predicate} -> MindRepo.link_nodes(subject, predicate, id)
    end
    send_resp(conn, 200, id)
  end

  post "/init" do
    :ok = MindRepo.initialize()
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

end
