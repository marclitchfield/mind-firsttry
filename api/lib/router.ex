defmodule MindRouter do
  use Plug.Router
  require Logger

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  post "/query/:root" do
    respond(conn, MindRepo.query_graph(root, conn.params))
  end

  post "/node" do
    respond(conn, MindRepo.new_node(conn.params))
  end

  post "/node/:id" do
    respond(conn, MindRepo.mutate_node(id, conn.params))
  end

  post "/graph" do
    respond(conn, MindRepo.mutate_graph(conn.params))
  end

  post "/search/:facet" do
    respond(conn, MindRepo.search_graph(facet, conn.params))
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

  defp respond(conn, :ok), do: send_resp(conn, 200, "Success")
  defp respond(conn, {:ok, results}) when is_map(results) or is_list(results), do: send_resp(conn, 200, results |> Poison.encode!)
  defp respond(conn, {:ok, message}), do: send_resp(conn, 200, message)
  defp respond(conn, {:error, :invalid_request, details}), do: send_resp(conn, 400, "Invalid request: #{details}")
  defp respond(conn, {:error, err}) when is_map(err), do: send_resp(conn, 500, "Server error: #{err |> Poison.encode!}")
  defp respond(conn, {:error, err}), do: send_resp(conn, 500, "Server error: #{err}")
  defp respond(conn, {:error, code, err}), do: send_resp(conn, 500, "Server error #{code}: #{err}")

end
