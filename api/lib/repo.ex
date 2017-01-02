defmodule MindRepo do
  @id_pred "id"
  @created_pred "created"

  def query_graph(id, query) do
    case Dgraph.query(id, query) do
      {:ok, response} -> {:ok, hd(response["node"])}
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
    with {:ok, _} <- Dgraph.mutate(to_ops(keywords, id)),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, id}
  end

  def mutate_node(id, options) do
    keywords = option_keywords(options)
    with {:ok, response} <- Dgraph.mutate(to_ops(keywords, id)),
         {:ok, _} <- process_documents(id, keywords),
    do: {:ok, response}
  end

  def mutate_graph(options_map) do
    keywords_map = for {id, options} <- options_map, into: %{}, do: {id, option_keywords(options)}
    quads = Enum.reduce(keywords_map, [], fn ({id, kw}, acc) -> acc ++ to_ops(kw, id) end)
    with {:ok, response} <- Dgraph.mutate(quads),
         {:ok, _} <- process_documents(keywords_map),
    do: {:ok, response}
  end

  defp process_documents(keywords_map) do
    keywords_map
      |> Enum.map(fn {id, keywords} -> Task.async(fn -> process_documents(id, keywords) end) end)
      |> Enum.map(&Task.await(&1))
      |> Enum.find({:ok, :success}, fn result -> elem(result, 0) == :error end)
  end

  require IEx
  defp process_documents(id, keywords) do
    save_documents(id, keywords.document, keywords.props)
    delete_documents(id, option_keywords(keywords.del))
  end

  defp save_documents(_id, empty, _) when empty == %{}, do: {:ok, :nop}
  defp save_documents(id, document, props) do
    document 
      |> Enum.map(fn {facet, source} -> Task.async(
          fn -> ElasticSearch.index(facet, id, Map.merge(source, props)) end) end)
      |> Enum.map(&Task.await(&1))
      |> Enum.find({:ok, :success}, fn result -> elem(result, 0) == :error end)
  end

  defp delete_documents(_id, empty) when empty == %{}, do: {:ok, :nop}
  defp delete_documents(id, keywords) do
    keywords.document
      |> Enum.filter(fn {_, delete} -> delete end)
      |> Enum.map(fn {facet, _} -> Task.async(fn -> ElasticSearch.delete(facet, id) end) end)
      |> Enum.map(&Task.await(&1))
      |> Enum.find({:ok, :success}, fn result -> elem(result, 0) == :error end)
  end

  defp to_ops(keywords, id) do
    set_quads = prop_quads(keywords.props, id) ++ in_quads(keywords.in, id) ++ out_quads(keywords.out, id)

    deletion_keywords = option_keywords(keywords.del)
    del_quads = prop_quads(deletion_keywords.props, id) 
      ++ in_quads(deletion_keywords.in, id) 
      ++ out_quads(deletion_keywords.out, id)

    [set: set_quads, del: del_quads]
  end

  defp option_keywords(options) do
    defaults = [props: %{}, in: %{}, out: %{}, del: %{}, document: %{}]
    option_kw = Enum.map(options, fn({key, value}) -> {String.to_atom(key), value} end)
    Keyword.merge(defaults, option_kw) |> Enum.into(%{})
  end

  defp prop_quads(props, id), do: props |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [value: o]) end)
  defp in_quads(ins, id), do: ins |> Enum.map(fn {p, s} -> Dgraph.quad(s, p, [node: id]) end)
  defp out_quads(outs, id), do: outs |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [node: o]) end)

  defp new_node_props(id) do
    %{@id_pred => id, @created_pred => (DateTime.utc_now |> DateTime.to_string)}
  end

end