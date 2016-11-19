defmodule MindRouter do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/api" do
    send_resp(conn, 200, "insert api here")
  end

  match _ do
    send_resp(conn, 404, "oops")
  end
end
