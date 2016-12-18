defmodule Dgraph do
  use HTTPoison.Base
  alias HTTPoison.Response

  @success_code "ErrorOk"
  @id_pred "id"
  @invalid_request_code "ErrorInvalidRequest"  
  @valid_id_regex ~r/^[a-zA-Z0-9.\-_]*$/
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
    IO.inspect {:dgraph_response, body |> Poison.decode!}
    body |> Poison.decode!
  end

  def quad(subject, predicate, object) do
    {[subject: subject, predicate: predicate, object: object]}
  end

  def query(id, query) do
    query_node(id, query_body(query)) |> execute
  end

  def mutate(ops) do
    mutation(ops) |> execute
  end

  defp mutation(ops) do
    case validate(ops) do
      {:ok, valid_ops} -> {:ok, "mutation { " <> mutation_body(valid_ops) <> " }"}
      error = {:error, _, _} -> error 
    end
  end

  defp validate(ops) do
    quads = for {_, quads} <- ops, quad <- quads, do: quad
    cond do
      Enum.any?(quads, fn {q} -> invalid_chars?(q[:subject]) end) -> {:error, :invalid_request, :subject}
      Enum.any?(quads, fn {q} -> invalid_chars?(q[:predicate]) end) -> {:error, :invalid_request, :predicate}
      true -> {:ok, ops}
    end
  end

  def invalid_chars?(atom) when is_atom(atom), do: false
  def invalid_chars?(string), do: !Regex.match?(@valid_id_regex, string)

  defp mutation_body(ops) do
    Enum.reduce(ops, [set: [], del: []], fn {op, quads}, acc -> Keyword.put(acc, op, acc[op] ++ quads) end)
      |> Enum.map(fn {op, quads} -> op_body(op, quads) end) |> Enum.join(" ")
  end

  defp op_body(_, []), do: ""
  defp op_body(:set, quads), do: "set { " <> build_quad_body(quads) <> " }"
  defp op_body(:del, ops), do: "delete { " <> build_quad_body(ops) <> " }"

  defp build_quad_body(quads) do
    (quads |> Enum.map(fn q -> quad_string(q) end) |> Enum.join(" .\n")) <> " ."
  end

  defp quad_string({[subject: subj, predicate: pred, object: obj]}) do
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

  defp unescape_values(list) when is_list(list) do
    Enum.map(list, fn x -> unescape_values(x) end)
  end

  defp unescape_values(value) do
    Enum.reduce(@escape_entities |> Enum.reverse, value, fn(replacement, acc) ->
      String.replace(acc, elem(replacement, 1), elem(replacement, 0))
    end)
  end

  defp query_node(xid, body), do: {:ok, "{ node(_xid_: #{xid}) { #{body} } }"}

  defp query_body(request) do
    request 
      |> Enum.map(fn {k, v} -> query_term(k, v) end)
      |> Enum.concat([@id_pred])
      |> Enum.join(" ")
  end

  defp query_term(property, value) when is_map(value) do
    "#{property} { #{query_body(value)} }"
  end

  defp query_term(property, value) when value, do: "#{property}"
  defp query_term(_property, _value), do: ""

  defp execute({:ok, query}) do
    IO.inspect {:dgraph_request, query}
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
