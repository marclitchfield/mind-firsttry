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

  def process_request_headers(headers), do: [{"Content-Type", "application/json"}] ++ headers

  def process_response_body(body) do
    IO.inspect {:neo4j_response, body |> Poison.decode!}
    body |> Poison.decode! 
  end

  def query(id, query) do
    {:ok, cypher_query(id, query)} |> execute
  end

  def mutate(id, ops) do
    mutation(id, ops) |> execute
  end

  defp mutation(id, ops) do
    with {:ok, valid_ops} <- validate(ops),
         mutation <- cypher_mutation(id, valid_ops),
    do: {:ok, mutation}
  end

  def cypher_query(id, query) do
    cypher_request(build_cypher(query, "{id: {id}}"), %{"id" => id})
  end

  defp build_cypher(query, props) do
    match_body = match_terms(query, "r")
    "MATCH (r #{props}) #{match_body} RETURN *"
  end

  defp match_terms(query, subject) do
    relationship_keys = query |> Enum.filter(fn {_k, v} -> is_map(v) end) |> Enum.map(fn {k, _} -> k end)

    Enum.reduce(relationship_keys, [], fn (k, acc) -> 
      target = "#{subject}_#{k}"
      acc ++ ["OPTIONAL MATCH (#{subject})-[_#{target}:#{k}]->(#{target})"] ++ match_terms(query[k], target)
    end)
  end

  defp cypher_mutation(id, ops) do
    node = "MERGE (n {id: {id}}) ON CREATE SET n = {props} ON MATCH SET n += {props} "
    set_outs = ops.out |> cypher_terms(fn(r, t, i) -> 
      "MERGE (t_#{i} {id: '#{t}'}) MERGE (n)-[:#{r}]->(t_#{i}) " end)
    set_ins  = ops.in  |> cypher_terms(fn(r, s, i) -> 
      "MERGE (s_#{i} {id: '#{s}'}) MERGE (s_#{i})-[:#{r}]->(n) " end)
    del_props = ops.del.props |> cypher_terms(fn (p, _, _) ->
      "REMOVE n.#{p} " end)
    del_outs = ops.del.out |> cypher_terms(fn(r, t, i) -> 
      "MATCH (n)-[r_out_#{i}:#{r}]->(d_t_#{i} {id: '#{t}'}) DELETE r_out_#{i} " end)
    del_ins  = ops.del.in  |> cypher_terms(fn(r, s, i) ->
      "MATCH (d_s_#{i} {id: '#{s}'})-[r_in_#{i}:#{r}]->(n) DELETE r_in_#{i} " end)
    return = "RETURN {node: n}"
    
    cypher_request(node <> set_outs <> set_ins <> del_props <> del_outs <> del_ins <> return, 
      %{ "id" => id, "props" => ops.props })
  end

  defp cypher_terms(query, func, sep \\ " ") do
    query
      |> Enum.with_index
      |> Enum.map(fn {{k, v}, i} -> func.(k, v, i) end)
      |> Enum.join(sep)
  end

  defp cypher_request(cypher, params) do
    %{"statements" => [
      %{
        "statement" => cypher,
        "resultDataContents" => ["graph"],
        "parameters" => params
      }
    ]}
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
    case post("/db/data/transaction/commit", payload) do
      # {:ok, %Response{status_code: code, body: %{"cause" => %{"errors" => err}}}} when code != 200 -> 
      #   {:error, Enum.map(err, fn e -> e["message"] end)}
      {:ok, %Response{status_code: 200, body: %{"results" => results}}} ->
        {:ok, results |> results_graph}
      error = {:error, _} -> error
    end
  end

  defp execute(error = {:error, _}), do: error
  defp execute(error = {:error, _, _}), do: error

  defp results_graph(results) do
    graphs = for result <- results, data <- result["data"], do: data["graph"]
    Enum.reduce(graphs, %{nodes: [], relationships: []}, fn (g, %{nodes: n, relationships: r}) -> 
      %{nodes: Enum.uniq(n ++ g["nodes"]), relationships: Enum.uniq(r ++ g["relationships"])} 
    end)
  end

end