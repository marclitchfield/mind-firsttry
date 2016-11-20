defmodule MindRouter do
  use Plug.Router
  require Logger
  require IEx
  alias Plug.Conn.Query

  plug Plug.Logger
  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug :match
  plug :dispatch

  # TODO: validate input predicates
  get "/ideas" do
    send_resp(conn, 200, Dgraph.query("self", "has.idea { 
      _xid_ body
      #{children(conn.params["p"])}
    }") |> Poison.encode!)
  end

  get "/idea/:id" do
    send_resp(conn, 200, Dgraph.query(id, 
      "_xid_ body\n" <> children(conn.params["p"])) |> Poison.encode!)
  end

  def children(nil), do: ""
  def children(predicates) do
    predicates 
      |> Enum.map(fn(pred) -> "#{pred} { _xid_ body }" end) 
      |> Enum.join("\n")
  end

  post "/ideas" do
    {:ok, id} = MindRepo.newnode(:self, "has.idea", :concept, conn.params["body"])
    case {conn.params["subject"], conn.params["predicate"]} do
      {nil, _} -> :ok
      {subject, predicate} -> MindRepo.linknodes(subject, predicate, id)
    end
    send_resp(conn, 200, id)
  end

  post "/init" do
    MindRepo.initialize()
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "oops")
  end
end
