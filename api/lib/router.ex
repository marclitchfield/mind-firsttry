defmodule MindRouter do
  @properties ~w(_xid_ body)
  
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  # TODO: validate input predicates
  get "/nodes/:predicate" do
    {:ok, nodes} = MindRepo.get_nodes(:self, @properties, [predicate], conn.params["p"])
    send_resp(conn, 200, nodes |> Poison.encode!)
  end

  get "/node/:id" do
    {:ok, node} = MindRepo.get_nodes(id, @properties, conn.params["p"])
    send_resp(conn, 200, node |> Poison.encode!)
  end

  post "/nodes/:predicate" do
    {predicate, type, body} = {predicate, conn.params["type"], conn.params["body"]}
    {:ok, id} = MindRepo.new_node(:self, predicate, type, body)
    case {conn.params["subject"], conn.params["subject_predicate"]} do
      {nil, _} -> :ok
      {subject, subject_predicate} -> MindRepo.link_nodes(subject, subject_predicate, id)
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
