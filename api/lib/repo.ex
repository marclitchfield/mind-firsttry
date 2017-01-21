defmodule MindRepo do
  @id_pred "id"
  @created_pred "created"

  def query_graph(id, query) do
    Neo4j.query(id, query) |> graph_response(id, query)
  end

  def search_graph(facet, query) do
    ElasticSearch.search(facet, query)
  end

  def new_node(options) do
    id = UUID.uuid4()
    opt = option_map(options)
    keywords = Map.put(opt, :props, Map.merge(opt[:props], new_node_props(id)))
    with {:ok, _} <- Neo4j.mutate(id, keywords),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, id}
  end

  def mutate_node(id, options) do
    keywords = option_map(options)
    with {:ok, response} <- Neo4j.mutate(id, keywords),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, response}
  end

  def mutate_graph(options_map) do
    keywords_map = for {id, options} <- options_map, into: %{}, do: {id, option_map(options)}
    with {:ok, _} <- mutate_nodes(keywords_map),
         {:ok, _} <- process_documents(keywords_map),
    do: :ok
  end

  defp graph_response(error = {:error, _}), do: error
  defp graph_response(error = {:error, _, _}), do: error
  defp graph_response({:ok, graph}, id, query) do
    root = graph.nodes |> Enum.find(fn n -> n["properties"]["id"] == id end)
    resp = build_response(graph, root, query)
    {:ok, resp}
  end

  defp build_response(graph, subject, query) do
    query 
      |> Enum.concat([{"id", true}])
      |> Enum.map(fn {k, v} -> build_response_node(graph, subject, query, k, v) end) 
      |> Enum.into(%{})
  end

  defp build_response_node(_graph, subject, _query, key, value) when value == true, do: {key, subject["properties"][key]}
  defp build_response_node(graph, subject, query, key, value) when is_map(value) do
    relationships = Enum.filter(graph.relationships, fn r -> r["startNode"] == subject["id"] && r["type"] == key end)
    children = relationships |> Enum.map(fn r ->
      child = Enum.find(graph.nodes, fn n -> n["id"] == r["endNode"] end)
      build_response(graph, child, query[key])
    end)
    {key, children}
  end

  defp mutate_nodes(keywords_map) do
    keywords_map |> parallel_do(fn (id, keywords) -> 
      Neo4j.mutate(id, keywords) end)
  end

  defp process_documents(keywords_map) do
    keywords_map |> parallel_do(fn (id, keywords) -> 
      process_documents(id, keywords) end)
  end

  defp process_documents(id, keywords) do
    save_documents(id, keywords.document, keywords.props)
    delete_documents(id, keywords.del)
  end

  defp save_documents(_id, empty, _) when empty == %{}, do: {:ok, :nop}
  defp save_documents(id, document, props) do
    document |> parallel_do(fn (facet, source) -> 
      ElasticSearch.index(facet, id, Map.merge(source, props)) end)
  end

  defp delete_documents(_id, empty) when empty == %{}, do: {:ok, :nop}
  defp delete_documents(id, keywords) do
    keywords.document 
      |> Enum.filter(fn {_, delete} -> delete end)
      |> parallel_do(fn(facet, _) -> ElasticSearch.delete(facet, id) end)
  end

  defp parallel_do(map, func) do
    map
      |> Enum.map(fn {k, v} -> Task.async(fn -> func.(k, v) end) end)
      |> Enum.map(&Task.await(&1))
      |> Enum.find({:ok, :success}, fn result -> elem(result, 0) == :error end)
  end

  defp option_map(options) do
    defaults = %{props: %{}, in: %{}, out: %{}, document: %{}, del: %{
      props: %{}, in: %{}, out: %{}, document: %{}
    }}
    map = AtomicMap.convert(options, safe: true)
    MapUtils.deep_merge(defaults, map)
  end

  defp new_node_props(id) do
    %{@id_pred => id, @created_pred => (DateTime.utc_now |> DateTime.to_string)}
  end

end