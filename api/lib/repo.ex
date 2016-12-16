defmodule MindRepo do
  @id_pred "id"
  @created_pred "created.at"

  def query_graph(id, query) do
    case Dgraph.query(id, query) do
      {:ok, response} -> {:ok, response["node"] |> Enum.at(0)}
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
    mutation_kw = Enum.map(mutations, fn({key, value}) -> {String.to_atom(key), value} end)
    defaults = [props: [], in: [], out: [], del: []]
    m = Keyword.merge(defaults, mutation_kw) |> Enum.into(%{})
    prop_quads = m.props |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [value: o]) end)
    in_quads = m.in |> Enum.map(fn {p, s} -> Dgraph.quad(s, p, [node: id]) end)
    out_quads = m.out |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [node: o]) end)
    del_quads = m.del |> Enum.map(fn {p, o} -> Dgraph.quad(id, p, [node: o]) end)
    [set: prop_quads ++ in_quads ++ out_quads, del: del_quads]
  end

  defp new_node_ops(id) do
    id_quad = Dgraph.quad(id, @id_pred, [value: id])
    created_quad = Dgraph.quad(id, @created_pred, [value: (DateTime.utc_now |> DateTime.to_string) ])
    [set: [id_quad, created_quad]]
  end

end