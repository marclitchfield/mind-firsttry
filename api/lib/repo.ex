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
    type = properties[@type_pred]
    case Map.has_key?(@types, String.to_atom(type)) do
      true -> 
        id = UUID.uuid4()
        object = Dgraph.quad(subject, predicate, [node: id])
        object_type = Dgraph.quad(id, @type_pred, [node: type])
        object_props = properties 
          |> Enum.reject(fn {k, _v} -> k == @type_pred end) 
          |> Enum.map(fn {k, v} -> Dgraph.quad(id, k, [value: v]) end)
        :ok = Dgraph.mutate([object, object_type] ++ object_props)
        {:ok, id}
      false -> {:error, :invalid_type, type}
    end
  end

  def link_nodes(subject, predicate, object) do
    quad = Dgraph.quad(subject, predicate, [node: object])
    Dgraph.mutate([quad])
  end

  def query_nodes(id, request) do
    Dgraph.query(id, request)
  end

  def delete_link(subject, predicate, object) do
    Dgraph.delete([ Dgraph.quad(subject, predicate, [node: object]) ])
  end

  def initialize() do
    types = @types |> Enum.map(fn({type, label}) -> Dgraph.quad(type, :label, [value: label]) end)
    self = Dgraph.quad(:self, :is, [node: :person])
    :ok = Dgraph.mutate(types ++ [self])
  end

end