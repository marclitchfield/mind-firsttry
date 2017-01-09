defmodule MindRepo do
  @id_pred "id"
  @created_pred "created"

  require IEx
  def query_graph(id, query) do
    case Neo4j.query(id, query) do
      {:ok, response} -> IEx.pry; {:ok, hd(response)}
      error -> error
    end
  end

  def search_graph(facet, query) do
    ElasticSearch.search(facet, query)
  end

  def new_node(options) do
    id = UUID.uuid4()
    opt = option_keywords(options)
    keywords = Map.put(opt, :props, Map.merge(opt[:props], new_node_props(id)))
    with {:ok, _} <- Neo4j.mutate(id, keywords),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, id}
  end

  def mutate_node(id, options) do
    keywords = option_keywords(options)
    with {:ok, response} <- Neo4j.mutate(id, keywords),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, response}
  end

  def mutate_graph(options_map) do
    keywords_map = for {id, options} <- options_map, into: %{}, do: {id, option_keywords(options)}
    with {:ok, response} <- mutate_nodes(keywords_map),
         {:ok, _} <- process_documents(keywords_map),
    do: :ok
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

  defp option_keywords(options) do
    defaults = [props: %{}, in: %{}, out: %{}, del: %{props: %{}, in: %{}, out: %{}, document: %{}}, document: %{}]
    option_kw = Enum.map(options, fn({key, value}) -> {String.to_atom(key), value} end)
    Keyword.merge(defaults, option_kw) |> Enum.into(%{})
  end

  defp prop_quads(props, id), do: props |> Enum.map(fn {p, o} -> Neo4j.quad(id, p, [value: o]) end)
  defp in_quads(ins, id), do: ins |> Enum.map(fn {p, s} -> Neo4j.quad(s, p, [node: id]) end)
  defp out_quads(outs, id), do: outs |> Enum.map(fn {p, o} -> Neo4j.quad(id, p, [node: o]) end)

  defp new_node_props(id) do
    %{@id_pred => id, @created_pred => (DateTime.utc_now |> DateTime.to_string)}
  end

end