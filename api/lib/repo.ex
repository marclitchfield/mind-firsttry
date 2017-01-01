defmodule MindRepo do
  @id_pred "id"
  @created_pred "created.at"

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
    keywords = option_keywords(options)
    ops = new_node_ops(id) ++ to_ops(keywords, id)
    with {:ok, _} <- Dgraph.mutate(ops),
      {:ok, _} <- save_document(id, keywords.document),
    do: {:ok, id}
  end

  def mutate_node(id, options) do
    keywords = option_keywords(options)
    with {:ok, response} <- Dgraph.mutate(to_ops(keywords, id)),
      {:ok, _} <- save_document(id, keywords.document),
    do: {:ok, response}
  end

  def mutate_graph(options_map) do
    keywords_map = for {id, options} <- options_map, into: %{}, do: {id, option_keywords(options)}
    quads = Enum.reduce(keywords_map, [], fn ({id, kw}, acc) -> acc ++ to_ops(kw, id) end)
    with {:ok, response} <- Dgraph.mutate(quads),
      {:ok, _} <- save_documents(keywords_map),
    do: {:ok, response}
  end

  defp save_document(id, map) when is_map(map), do: save_document(id, hd(Enum.into(map, [])))
  defp save_document(id, {facet, document}), do: ElasticSearch.index(facet, id, document)
  defp save_document(id, []), do: {:ok, :nop}

  defp save_documents(keywords_map) do
    keywords_map
      |> Enum.map(fn {id, keywords} -> Task.async(fn -> save_document(id, keywords.document) end) end)
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
    defaults = [props: [], in: [], out: [], del: [], document: []]
    option_kw = Enum.map(options, fn({key, value}) -> {String.to_atom(key), value} end)
    Keyword.merge(defaults, option_kw) |> Enum.into(%{})
  end

  defp prop_quads(props, id), do: props |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [value: o]) end)
  defp in_quads(ins, id), do: ins |> Enum.map(fn {p, s} -> Dgraph.quad(s, p, [node: id]) end)
  defp out_quads(outs, id), do: outs |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [node: o]) end)

  defp new_node_ops(id) do
    id_quad = Dgraph.quad(id, @id_pred, [value: id])
    created_quad = Dgraph.quad(id, @created_pred, [value: (DateTime.utc_now |> DateTime.to_string) ])
    [set: [id_quad, created_quad]]
  end

end