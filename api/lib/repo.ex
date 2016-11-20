defmodule MindRepo do

  def new_node(source, predicate, type, body) do
    id = UUID.uuid4()
    :ok = Dgraph.mutate([
      Dgraph.quad(source, predicate, [node: id]),
      Dgraph.quad(id, :body, [text: body]),
      Dgraph.quad(id, :type, [node: type]) 
    ])
    {:ok, id}
  end

  def link_nodes(source, predicate, object) do
    :ok = Dgraph.mutate([ Dgraph.quad(source, predicate, [node: object]) ])
  end

  def get_nodes(source, properties, predicates), do: get_nodes(source, properties, predicates, nil)

  def get_nodes(source, properties, predicates, child_predicates) do
    Dgraph.query_nodes(source, properties, predicates, child_predicates)
  end

  def initialize() do
    :ok = Dgraph.mutate([
      Dgraph.quad(:space, :label, [text: "Space"]),
      Dgraph.quad(:concept, :label, [text: "Concept"]),
      Dgraph.quad(:event, :label, [text: "Event"]),
      Dgraph.quad(:person, :label, [text: "Person"]),
      Dgraph.quad(:object, :label, [text: "Object"]),
      Dgraph.quad(:self, :type, [node: :person])
    ])
  end
  
end