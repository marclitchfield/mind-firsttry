defmodule ApiTest do
  use ExUnit.Case
  use Plug.Test
  alias MindRouter, as: Router
  doctest Api
  @opts Router.init([])
  @default_subject "tests"
  @default_predicate "pred"
  @default_type "concept"
  @default_body "Test Node Body"
  @default_props [is: @default_type, body: @default_body]
  @special_chars ~s(sq:' dq:" bs:\\ # lb:} rb:{ amp:&)
  
  test "initialize" do
    response = call_post("/init")
    assert response.status == 200
  end

  test "post node" do
    response = post_node()
    assert response.status == 200
  end

  test "post related node" do
    id = post_node().resp_body
    response = post_node(subject: id)
    assert response.status == 200
  end

  test "get node by id" do
    id = post_node().resp_body
    response = query_node(id, %{"body" => true, "created.at" => true}) |> to_json
    assert response["me"]["_xid_"] == id
    assert response["me"]["body"] == @default_body
    assert response["me"]["created.at"] != nil
  end

  @tag :wip
  test "node has valid 'is' predicate" do
    id = post_node().resp_body
    response = query_node(id, %{"body" => true, "is" => %{}}) |> to_json
    assert response["me"]["is"]["_xid_"] == @default_type
  end

  test "get related nodes" do
    id_subject = post_node().resp_body
    id_object = post_node(subject: id_subject, props: @default_props).resp_body
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response["me"]["_xid_"] == id_subject
    assert response["me"][@default_predicate]["_xid_"] == id_object
  end

  test "get multiple related nodes" do
    id_subject = post_node().resp_body
    id_object1 = post_node(subject: id_subject).resp_body
    id_object2 = post_node(subject: id_subject).resp_body
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response["me"][@default_predicate] |> Enum.any?(fn x -> x["_xid_"] == id_object1 end)
    assert response["me"][@default_predicate] |> Enum.any?(fn x -> x["_xid_"] == id_object2 end)
  end

  test "post new node with links to other nodes" do
    id_object1 = post_node().resp_body
    id_object2 = post_node().resp_body
    id_subject = post_node(props: [links: [link1: id_object1, link2: id_object2]] ++ @default_props).resp_body
    response = query_node(id_subject, %{"link1" => %{}, "link2" => %{}}) |> to_json
    assert response["me"]["link1"] != nil
    assert response["me"]["link2"] != nil
  end  

  test "link existing nodes" do
    id_subject = post_node().resp_body
    id_object = post_node().resp_body
    post_link(id_subject, @default_predicate, id_object, [newprop: "new"])
    response = query_node(id_subject, %{@default_predicate => %{"newprop" => true}}) |> to_json
    assert response["me"][@default_predicate]["_xid_"] == id_object
    assert response["me"][@default_predicate]["newprop"] == "new"
  end

  test "delete relationship" do
    id_subject = post_node().resp_body
    id_object = post_node(subject: id_subject).resp_body
    delete_link(id_subject, @default_predicate, id_object)
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response["me"][@default_predicate] == nil
  end

  test "post and query with special characters in body" do
    id = post_node(predicate: @default_predicate, props: [is: @default_type, body: @special_chars]).resp_body
    response = query_node(id, %{"body" => true}) |> to_json
    assert response["me"]["body"] == @special_chars
  end

  test "post with special characters in predicate returns error" do
    response = post_node(predicate: @special_chars)
    assert response.status == 400
  end

  defp post_node(options \\ []) do
    defaults = [subject: @default_subject, predicate: @default_predicate, props: @default_props]
    opts = Keyword.merge(defaults, options) |> Enum.into(%{})
    call_post("/graph/#{opts.subject}/#{opts.predicate}", opts.props)
  end

  defp post_link(subject, predicate, object, props) do
    call_post("/graph/#{subject}/#{predicate}/#{object}", props)
  end

  defp query_node(id, query) do
    call_post("/query/#{id}", query)
  end

  defp delete_link(subject, predicate, object) do
    call_delete("/graph/#{subject}/#{predicate}/#{object}")
  end

  defp call_post(url, payload \\ nil) do
    conn(:post, url, payload) 
      |> put_req_header("content-type", "application/json")
      |> Router.call(@opts)
  end

  defp call_delete(url) do
    conn(:delete, url) |> Router.call(@opts)
  end

  defp to_json(response) do
    case response.status do
      200 -> response.resp_body |> Poison.decode!
      _ -> flunk response.resp_body
    end
  end
  
end
