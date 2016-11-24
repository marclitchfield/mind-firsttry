defmodule MindRouter do
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  post "/query/:root" do
    respond(conn, MindRepo.query_nodes(root, conn.params))
  end

  post "/nodes/:subject/:predicate" do
    respond(conn, MindRepo.new_node(subject, predicate, conn.params))
  end

  delete "/node/:subject/:predicate/:object" do
    respond(conn, MindRepo.delete_link(subject, predicate, object))
  end

  post "/init" do
    respond(conn, MindRepo.initialize())
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

  defp respond(conn, :ok), do: send_resp(conn, 200, "Success")
  defp respond(conn, {:ok, results}) when is_map(results), do: send_resp(conn, 200, results |> Poison.encode!)
  defp respond(conn, {:ok, message}), do: send_resp(conn, 200, message)
  defp respond(conn, {:error, :invalid_request, details}), do: send_resp(conn, 400, "Invalid request: #{details}")
  defp respond(conn, {:error, err}), do: send_resp(conn, 500, "Server error: #{err}")

end
