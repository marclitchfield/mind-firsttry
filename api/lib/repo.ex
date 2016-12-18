defmodule MindRepo do
  @id_pred "id"
  @created_pred "created.at"

  def query_graph(id, query) do
    case Dgraph.query(id, query) do
      {:ok, response} -> {:ok, hd(response["node"])}
      error -> error
    end
  end

  def new_node(mutations) do
    id = UUID.uuid4()
    ops = new_node_ops(id) ++ (mutations |> to_ops(id))
    case Dgraph.mutate(ops) do
      {:ok, _} -> {:ok, id}
      error -> error
    end
  end

  def mutate_node(id, mutations) do
    Dgraph.mutate(mutations |> to_ops(id))
  end

  def mutate_graph(mutations_map) do
    quads = Enum.reduce(mutations_map, [], fn ({id, m}, acc) -> acc ++ (m |> to_ops(id)) end)
    Dgraph.mutate(quads)
  end

  def to_ops(mutations, id) do
    m = mutation_keywords(mutations)
    set_quads = prop_quads(m.props, id) ++ in_quads(m.in, id) ++ out_quads(m.out, id)

    dm = mutation_keywords(m.del)
    del_quads = prop_quads(dm.props, id) ++ in_quads(dm.in, id) ++ out_quads(dm.out, id)

    [set: set_quads, del: del_quads]
  end

  defp mutation_keywords(mutations) do
    defaults = [props: [], in: [], out: [], del: []]
    mutation_kw = Enum.map(mutations, fn({key, value}) -> {String.to_atom(key), value} end)
    Keyword.merge(defaults, mutation_kw) |> Enum.into(%{})
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