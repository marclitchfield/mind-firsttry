defmodule MindRepo do
  def newnode(source, predicate, type, body) do
    id = UUID.uuid4()
    Dgraph.mutate([
      Dgraph.quad(source, predicate, [node: id]),
      Dgraph.quad(id, :body, [text: body]),
      Dgraph.quad(id, :type, [node: type]) 
    ])
    {:ok, id}
  end

  def linknodes(source, predicate, object) do
    Dgraph.mutate([ Dgraph.quad(source, predicate, [node: object]) ])
  end

  def initialize() do
    Dgraph.mutate([
      Dgraph.quad(:space, :label, [text: "Space"]),
      Dgraph.quad(:concept, :label, [text: "Concept"]),
      Dgraph.quad(:event, :label, [text: "Event"]),
      Dgraph.quad(:person, :label, [text: "Person"]),
      Dgraph.quad(:object, :label, [text: "Object"]),
      Dgraph.quad(:self, :type, [node: :person])
    ])
  end
end