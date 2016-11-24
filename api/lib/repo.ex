defmodule MindRepo do
  @type_pred "is"
  @types %{
    :space => "Space",
    :concept => "Concept",
    :event => "Event",
    :person => "Person",
    :object => "Object"
  }

  def new_node(subject, predicate, props) do
    object_id = UUID.uuid4()
    object_type = Dgraph.quad(object_id, @type_pred, [node: props[@type_pred]])     
    case Map.has_key?(props, @type_pred) do
      true -> new_node(subject, predicate, object_id, props, [object_type])
      false -> {:error, :missing_predicate, @type_pred}
    end
  end

  def new_node(subject, predicate, object, props) do
    new_node(subject, predicate, object, props, [])
  end

  defp new_node(subject, predicate, object, props, type) do
    case Dgraph.update(new_node_quads(subject, predicate, object, props) ++ type) do
      {:ok, _} -> {:ok, object}
      error -> error
    end
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

  defp new_node_quads(subject, predicate, object, props) do
    object_quad = Dgraph.quad(subject, predicate, [node: object])
    properties = props
      |> Enum.reject(fn {k, _} -> k == @type_pred end)
      |> Enum.map(fn {k, v} -> Dgraph.quad(object, k, [value: v]) end)
    [object_quad] ++ properties
  end

end