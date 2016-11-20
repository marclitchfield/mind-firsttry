defmodule MindRouter do
  use Plug.Router
  require Logger
  require IEx

  plug Plug.Logger
  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug :match
  plug :dispatch

  get "/ideas" do
    send_resp(conn, 200, Dgraph.query("self", "has.idea { _xid_ body }") |> Poison.encode!)
  end

  post "/ideas" do
    id = UUID.uuid4()
    Dgraph.mutate([
      Dgraph.quad(:self, "has.idea", [node: id]),
      Dgraph.quad(id, :body, [text: conn.body_params["body"]]),
      Dgraph.quad(id, :type, [node: :concept])
    ])
    send_resp(conn, 200, "ok")
  end

  post "/init" do
    Dgraph.mutate([
        Dgraph.quad(:space, :label, [text: "Space"]),
        Dgraph.quad(:concept, :label, [text: "Concept"]),
        Dgraph.quad(:event, :label, [text: "Event"]),
        Dgraph.quad(:person, :label, [text: "Person"]),
        Dgraph.quad(:object, :label, [text: "Object"]),
        Dgraph.quad(:self, :type, [node: :person])
    ])
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "oops")
  end
end
