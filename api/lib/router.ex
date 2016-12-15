defmodule MindRouter do
  use Plug.Router
  require Logger
  @props "props"
  @links "links"
  @removals "removals"

  plug Plug.Parsers, parsers: [:json], json_decoder: Poison
  plug Plug.Logger
  plug :match
  plug :dispatch

  post "/query/:root" do
    respond(conn, MindRepo.query_nodes(root, conn.params))
  end

  post "/graph/:subject/:predicate" do
    respond(conn, MindRepo.new_node(subject, predicate, conn.params[@props] || %{}, conn.params[@links] || %{}))
  end

  post "/graph/:subject/:predicate/:object" do
    respond(conn, MindRepo.link_nodes(subject, predicate, object, conn.params[@props], conn.params[@links]))
  end

  post "/graph/:subject" do
    respond(conn, MindRepo.update_node(subject, conn.params[@props], conn.params[@links], conn.params[@removals]))
  end

  delete "/graph/:subject/:predicate/:object" do
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
  defp respond(conn, {:error, code, err}), do: send_resp(conn, 500, "Server error #{code}: #{err}")

end
