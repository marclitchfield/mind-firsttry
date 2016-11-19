defmodule MindRouter do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/api" do
    send_resp(conn, 200, Dgraph.query |> Poison.encode!)
  end

  get "/init" do
    Dgraph.mutate
    send_resp(conn, 200, "initialized")
  end

  match _ do
    send_resp(conn, 404, "oops")
  end
end
