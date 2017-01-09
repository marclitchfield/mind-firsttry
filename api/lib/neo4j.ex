defmodule Neo4j do
  use HTTPoison.Base
  alias HTTPoison.Response
  @valid_id_regex ~r/^[a-zA-Z0-9.\-_]*$/

  def process_url(url) do
    Application.get_env(:api, :neo4j_url) <> url
  end

  def process_request_body(body) do
    IO.inspect {:neo4j_request, body}
    body |> Poison.encode!
  end

  def process_response_body(body) do
    IO.inspect {:neo4j_response, body |> Poison.decode!}
    body |> Poison.decode! 
  end

 def quad(subject, predicate, object) do
    {[subject: subject, predicate: predicate, object: object]}
  end

  def query(id, query) do
    {:ok, cypher_query(id, query)} |> execute
  end

  def mutate(id, ops) do
    mutation(id, ops) |> execute
  end

  defp mutation(id, ops) do
    with {:ok, valid_ops} <- validate(ops),
         mutation <- cypher_mutation(id, ops),
    do: {:ok, mutation}
  end

  defp cypher_query(id, query) do
    matches = query_matches(query, "n")
    returns = query_returns(query, "n")
    %{
      "query" => "MATCH (n) WHERE n.id = {id} #{matches} RETURN {node: {#{returns}}}",
      "params" => %{ "id" => id }
     }
  end

  defp query_matches(query, subject) do
    query |> cypher_terms(fn(k, v, i) -> query_match_terms(k, v, subject, i) end, " ")
  end

  defp query_match_terms(key, value, subject, i) when value == true, do: ""
  defp query_match_terms(key, value, subject, i) when is_map(value) do
    object = subject <> "_#{i}"
    "OPTIONAL MATCH (#{subject})-[:#{key}]->(#{object}) " <> query_matches(value, object)
  end

  defp query_returns(query, subject) do
    query 
      |> Enum.with_index 
      |> Enum.map(fn {{k, v}, i} -> query_return_term(k, v, subject, i) end) 
      |> Enum.concat(["id: #{subject}.id"])
      |> Enum.join(", ")
  end

  defp query_return_term(key, value, subject, i) when value == true, do: "#{key}: #{subject}.#{key}"
  defp query_return_term(key, value, subject, i) when is_map(value) do
    object = subject <> "_#{i}"
    body = query_returns(value, object)
    "#{key}: { #{body} }"
  end

  defp cypher_mutation(id, ops) do
    node = "MERGE (n {id: {id}}) ON CREATE SET n = {props} ON MATCH SET n += {props} "
    outs = ops.out |> cypher_terms(fn(r, t, i) -> "MERGE (t_#{i} {id: '#{t}'}) MERGE (n)-[:#{r}]->(t_#{i}) " end)
    ins = ops.in |> cypher_terms(fn(r, s, i) -> "MERGE (s_#{i} {id: '#{s}'}) MERGE (s_#{i})-[:#{r}]->(n) " end)
    return = "RETURN {node: n}"
    %{
      "query" => node <> outs <> ins <> return, 
      "params" => %{ "id" => id, "props" => ops.props }
     }
  end

  defp cypher_terms(query, func, sep \\ " ") do
    query
      |> Enum.with_index
      |> Enum.map(fn {{k, v}, i} -> func.(k, v, i) end)
      |> Enum.join(sep)
  end

  defp validate(ops) do
    cond do
      invalid_predicate?(ops.in) -> {:error, :invalid_request, :predicate}
      invalid_predicate?(ops.out) -> {:error, :invalid_request, :predicate}
      invalid_predicate?(ops.del.in) -> {:error, :invalid_request, :predicate}
      invalid_predicate?(ops.del.out) -> {:error, :invalid_request, :predicate}
      true -> {:ok, ops}
    end
  end

  defp invalid_predicate?(ops), do: Enum.any?(ops, fn {x, _} -> invalid_chars?(x) end)

  def invalid_chars?(atom) when is_atom(atom), do: false
  def invalid_chars?(string), do: !Regex.match?(@valid_id_regex, string)

  defp execute({:ok, payload}) do
    case post("/db/data/cypher", payload) do
      {:ok, %HTTPoison.Response{status_code: code, body: %{"cause" => %{"errors" => err}}}} when code != 200 -> 
        {:error, Enum.map(err, fn e -> e["message"] end)}
      {:ok, %HTTPoison.Response{status_code: 200, body: %{"data" => data}}} ->
        {:ok, Enum.map(data, fn d -> hd(d)["node"] end)}
      error = {:error, _} -> error
    end
  end

  defp execute(error = {:error, _}), do: error
  defp execute(error = {:error, _, _}), do: error

end