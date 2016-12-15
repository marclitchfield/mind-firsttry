defmodule MindRepo do
  @type_prop "is"
  @links_prop "links"
  @created_pred "created.at"
  @types %{
    :space => "Space",
    :concept => "Concept",
    :event => "Event",  
    :person => "Person",
    :object => "Object"
  }

  def new_node(subject, predicate, props, links) do
    object = UUID.uuid4()
    case Map.has_key?(links, @type_prop) do
      true -> insert(subject, predicate, object, props, links)
      false -> {:error, :missing_predicate, @type_prop}
    end 
  end

  def link_nodes(subject, predicate, object, props, links) do
    insert(subject, predicate, object, props, links)
  end

  def update_node(id, props, links, removals) do
    insert_quads = build_quads(id, props, links)
    delete_quads = build_quads(id, [], removals)
    Dgraph.update(insert_quads, delete_quads)
  end

  def query_nodes(id, request) do
    case Dgraph.query(id, request) do
      {:ok, response} -> {:ok, response["me"] |> transform_xids}
      error -> error
    end
  end

  def delete_link(subject, predicate, object) do
    Dgraph.delete([ Dgraph.quad(subject, predicate, [node: object]) ])
  end

  def initialize() do
    self = Dgraph.quad(:self, :is, [node: :person])
    types = @types |> Enum.map(fn({type, label}) -> Dgraph.quad(type, :label, [value: label]) end)
    Dgraph.update([self] ++ types)
  end

  defp insert(subject, predicate, object, props, links) do
    quads = new_node_quads(subject, predicate, object) ++ build_quads(object, props, links)
    case Dgraph.update(quads) do
      {:ok, _} -> {:ok, object}
      error -> error
    end
  end

  defp build_quads(object, props, links) do
    prop_quads = props |> Enum.map(fn {k, v} -> Dgraph.quad(object, k, [value: v]) end)
    link_quads = links |> Enum.map(fn {pred, link_obj} -> Dgraph.quad(object, pred, [node: link_obj]) end)
    prop_quads ++ link_quads
  end

  defp key_values(key, props) do
    case props do
      %{^key => values} when is_map(values) -> values
      %{^key => value} -> [value]
      _ -> []
    end
  end

  defp new_node_quads(subject, predicate, object) do
    object_quad = Dgraph.quad(subject, predicate, [node: object])
    created_quad = Dgraph.quad(object, @created_pred, [value: (DateTime.utc_now |> DateTime.to_string) ])
    [object_quad, created_quad]
  end

  defp transform_xids(graph) when is_map(graph) do
    graph |> Enum.map(fn {k, v} -> { xid_to_id(k), transform_xids(v) } end) |> Enum.into(%{})
  end

  defp transform_xids(list) when is_list(list), do: list |> Enum.map(fn x -> transform_xids(x) end)
  defp transform_xids(value), do: value

  defp xid_to_id("_xid_"), do: "id"
  defp xid_to_id(key), do: key

end