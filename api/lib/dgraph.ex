defmodule Dgraph do
  use HTTPoison.Base
  alias HTTPoison.Response
  @success_code "ErrorOk"
  @invalid_request_code "ErrorInvalidRequest"  
  @valid_id_regex ~r/^[a-zA-Z0-9.-]*$/
  @escape_entities [
    {"&", "&amp;"},
    {"\"", "&quot;"},
    {"\\", "&bs;"},
    {"{", "&lb;"},
    {"}", "&rb;"}
  ]
  
  def process_url(url) do
    Application.get_env(:api, :dgraph_url) <> url
  end

  def process_response_body(body) do
    body |> Poison.decode!
  end

  def quad(subject, predicate, object) do
    [subject: subject, predicate: predicate, object: object]
  end

  def update(quads) do
    mutation(:set, quads) |> execute
  end

  def delete(quads) do
    mutation(:delete, quads) |> execute
  end

  def query(xid, request) do
    query_root(xid, query_body(request)) |> execute
  end

  defp mutation(verb, quads) when is_list(quads), do: mutation(verb, quad_body(quads))
  defp mutation(:set, {:ok, body}), do: {:ok, "mutation { set { #{body} } }"}
  defp mutation(:delete, {:ok, body}), do: {:ok, "mutation { delete { #{body} } }"}
  defp mutation(_, error = {:error, _, _}), do: error

  defp quad_body(quads) do
    cond do
      Enum.any?(quads, fn q -> invalid_chars?(q[:subject]) end) -> {:error, :invalid_request, :subject}
      Enum.any?(quads, fn q -> invalid_chars?(q[:predicate]) end) -> {:error, :invalid_request, :predicate}
      true -> {:ok, build_quad_body(quads)}
    end
  end

  def invalid_chars?(atom) when is_atom(atom), do: false
  def invalid_chars?(string), do: !Regex.match?(@valid_id_regex, string)

  defp build_quad_body(quads) do
    (quads |> Enum.map(fn q -> quad_string(q) end) |> Enum.join(" .\n")) <> " ."
  end

  defp quad_string([subject: subj, predicate: pred, object: obj]) do
    "<#{subj}> <#{pred}> " <> object_string(obj)
  end

  defp object_string([node: xid]), do: ~s(<#{xid}>)
  defp object_string([value: value]), do: ~s("#{value |> escape_value}")

  defp escape_value(atom) when is_atom(atom), do: atom
  defp escape_value(string) do
    Enum.reduce(@escape_entities, string, fn(replacement, acc) -> 
      String.replace(acc, elem(replacement, 0), elem(replacement, 1)) 
    end)
  end

  defp unescape_values(map) when is_map(map) do
    Enum.map(map, fn {k, v} -> {k, unescape_values(v)} end) |> Enum.into(%{})
  end
  
  defp unescape_values(value) do
    Enum.reduce(@escape_entities |> Enum.reverse, value, fn(replacement, acc) ->
      String.replace(acc, elem(replacement, 1), elem(replacement, 0))
    end)
  end

  defp query_root(xid, body), do: {:ok, "{ me(_xid_: #{xid}) { #{body} } }"}

  defp query_body(request) do
    "_xid_ " <> (request |> Enum.map(fn {k, v} -> query_term(k, v) end) |> Enum.join(" "))
  end

  defp query_term(property, value) when is_map(value) do
    property <> " { " <> query_body(value) <> "}"
  end

  defp query_term(property, value) when value, do: property
  defp query_term(_property, _value), do: ""

  defp execute({:ok, query}) do
    IO.puts(query)
    case post("/query", query) do
      {:ok, %Response{body: %{"code" => @success_code, "message" => message}}} -> 
        {:ok, message}
      {:ok, %Response{body: %{"code" => @invalid_request_code, "message" => message}}} -> 
        {:error, :invalid_request, message}
      {:ok, %Response{body: %{"code" => error}}} -> 
        {:error, error}
      {:ok, %Response{body: body}} ->
        {:ok, body |> unescape_values}
      error = {:error, _} -> error
    end
  end

  defp execute(error = {:error, _}), do: error
  defp execute(error = {:error, _, _}), do: error

end
