defmodule MindRepo do
  @type_pred "is"
  @types %{
    :space => "Space",
    :concept => "Concept",
    :event => "Event",
    :person => "Person",
    :object => "Object"
  }

  def new_node(subject, predicate, properties) do
    case Map.has_key?(properties, @type_pred) do
      true -> insert_new_node(subject, predicate, properties)
      false -> {:error, :missing_predicate, @type_pred}
    end
  end

  def link_nodes(subject, predicate, object) do
    quad = Dgraph.quad(subject, predicate, [node: object])
    Dgraph.update([quad])
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

 
  defp insert_new_node(subject, predicate, properties) do
    id = UUID.uuid4()
    case Dgraph.update(new_node_quads(subject, predicate, id, properties)) do
      {:ok, _} -> {:ok, id}
      error -> error
    end
  end

  defp new_node_quads(subject, predicate, id, properties) do
    object = Dgraph.quad(subject, predicate, [node: id])
    object_type = Dgraph.quad(id, @type_pred, [node: properties[@type_pred]])
    props = properties
      |> Enum.reject(fn {k, _} -> k == @type_pred end)
      |> Enum.map(fn {k, v} -> Dgraph.quad(id, k, [value: v]) end)
    [object, object_type] ++ props
  end

end