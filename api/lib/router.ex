defmodule MindRouter do
  @properties ~w(_xid_ body)
  
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  post "/query/:root" do
    case MindRepo.query_nodes(root, conn.params) do
      {:ok, results} -> send_resp(conn, 200, results |> Poison.encode!)
    end
  end

  post "/nodes/:predicate" do
    {type, body} = {conn.params["is"], conn.params["body"]}
    case MindRepo.new_node(:self, predicate, type, body) do
      {:ok, id} -> MindRepo.link_nodes(conn.params["subject"], conn.params["predicate"], id)
        send_resp(conn, 200, id)
      {:error, :invalid_type, type} ->
        send_resp(conn, 400, "Invalid type: #{type}")
    end
  end

  delete "/node/:subject/:predicate/:object" do
    :ok = MindRepo.delete_link(subject, predicate, object)
    send_resp(conn, 200, "deleted")
  end

  post "/init" do
    :ok = MindRepo.initialize()
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

end
