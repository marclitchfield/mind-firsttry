defmodule MindRepo do
  @types %{
    :space => "Space",
    :concept => "Concept",
    :event => "Event",
    :person => "Person",
    :object => "Object"
  }

  def new_node(subject, predicate, type, body) do
    case Map.has_key?(@types, String.to_atom(type)) do
      true -> 
        id = UUID.uuid4()
        :ok = Dgraph.mutate([
          Dgraph.quad(subject, predicate, [node: id]),
          Dgraph.quad(id, :body, [text: body]),
          Dgraph.quad(id, :type, [node: type]) 
        ])
        {:ok, id}
      false -> {:error, :invalid_type, type}
    end
  end

  def link_nodes(_subject, nil, _), do: :ok

  def link_nodes(subject, predicate, object) do
    :ok = Dgraph.mutate([ Dgraph.quad(subject, predicate, [node: object]) ])
  end

  def get_nodes(subject, properties, predicates \\ nil, child_predicates \\ nil) do
    Dgraph.query_nodes(subject, properties, predicates, child_predicates)
  end

  def delete_link(subject, predicate, object) do
    Dgraph.delete([ Dgraph.quad(subject, predicate, [node: object]) ])
  end

  def initialize() do
    types = @types |> Enum.map(fn({type, label}) -> Dgraph.quad(type, :label, [text: label]) end)
    self = Dgraph.quad(:self, :type, [node: :person])
    :ok = Dgraph.mutate(types ++ [self])
  end

end