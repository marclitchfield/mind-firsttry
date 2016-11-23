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
      true -> 
        id = UUID.uuid4()
        object = Dgraph.quad(subject, predicate, [node: id])
        props = properties |> Enum.map(
          fn {k, v} -> Dgraph.quad(id, k, [value: v]) end)
        :ok = Dgraph.mutate([object] ++ props)
        {:ok, id}
      false -> 
        {:error, :missing_predicate, @type_pred}
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