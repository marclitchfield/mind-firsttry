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

  def new_node(subject, predicate, props) do
    object = UUID.uuid4()
    case Map.has_key?(props, @type_prop) do
      true -> update(subject, predicate, object, props)
      false -> {:error, :missing_predicate, @type_prop}
    end
  end

  def link_nodes(subject, predicate, object, props) do
    update(subject, predicate, object, props)
  end

  def query_nodes(id, request) do
    Dgraph.query(id, request)
  end

  def delete_link(subject, predicate, object) do
    Dgraph.delete([ Dgraph.quad(subject, predicate, [node: object]) ])
  end

  def initialize() do
    self = Dgraph.quad(:self, :is, [node: :person])
    types = @types |> Enum.map(fn({type, label}) -> Dgraph.quad(type, :label, [value: label]) end)
    Dgraph.update([self] ++ types)
  end

  defp update(subject, predicate, object, props) do
    object_type = key_values(@type_prop, props) 
      |> Enum.map(fn type -> Dgraph.quad(object, @type_prop, [node: type]) end)
    links = key_values(@links_prop, props)
      |> Enum.map(fn {pred, link_obj} -> Dgraph.quad(object, pred, [node: link_obj]) end)
    quads = new_node_quads(subject, predicate, object, props) ++ object_type ++ links
    case Dgraph.update(quads) do
      {:ok, _} -> {:ok, object}
      error -> error
    end
  end

  defp key_values(key, props) do
    case props do
      %{^key => values} when is_map(values) -> values
      %{^key => value} -> [value]
      _ -> []
    end
  end

  defp new_node_quads(subject, predicate, object, props) do
    object_quad = Dgraph.quad(subject, predicate, [node: object])
    created_quad = Dgraph.quad(object, @created_pred, [value: (DateTime.utc_now |> DateTime.to_string) ])
    properties = props
      |> Enum.reject(fn {k, _} -> k == @type_prop end)
      |> Enum.reject(fn {k, _} -> k == @links_prop end)
      |> Enum.map(fn {k, v} -> Dgraph.quad(object, k, [value: v]) end)
    [object_quad, created_quad] ++ properties
  end

end