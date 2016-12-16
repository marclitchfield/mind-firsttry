defmodule ApiTest do
  use ExUnit.Case
  use Plug.Test
  alias MindRouter, as: Router
  doctest Api
  @opts Router.init([])
  @default_subject "tests"
  @default_predicate :pred
  @default_type "concept"
  @default_body "Test Node Body"
  @default_props [body: @default_body]
  @default_links [is: @default_type]
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
    response = query_node(id, [body: true, "created.at": true]) |> to_json
    assert response.id == id
    assert response.body == @default_body
    assert response[:"created.at"] != nil
  end

  test "node has valid 'is' predicate" do
    id = post_node().resp_body
    response = query_node(id, [body: true, is: %{}]) |> to_json
    assert response.is != nil
  end

  test "get related nodes" do
    id_subject = post_node().resp_body
    id_object = post_node(subject: id_subject).resp_body
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response.id == id_subject
    assert Enum.at(response[@default_predicate], 0).id == id_object
  end

  test "get multiple related nodes" do
    id_subject = post_node().resp_body
    id_object1 = post_node(subject: id_subject).resp_body
    id_object2 = post_node(subject: id_subject).resp_body
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response[@default_predicate] |> Enum.any?(fn x -> x.id == id_object1 end)
    assert response[@default_predicate] |> Enum.any?(fn x -> x.id == id_object2 end)
  end

  test "post new node with links to other nodes" do
    id_object1 = post_node().resp_body
    id_object2 = post_node().resp_body
    id_subject = post_node(links: [link1: id_object1, link2: id_object2] ++ @default_links).resp_body
    response = query_node(id_subject, [link1: %{}, link2: %{}]) |> to_json
    assert response.link1 != nil
    assert response.link2 != nil
  end  

  test "link existing nodes" do
    id_subject = post_node().resp_body
    id_object = post_node().resp_body
    post_link(subject: id_subject, object: id_object, props: [newprop: "new"], links: [newlink: id_object])
    response = query_node(id_subject, %{@default_predicate => [newprop: true, newlink: %{}]}) |> to_json
    linked = Enum.at(response[@default_predicate], 0)
    assert linked.id == id_object
    assert linked.newprop == "new"
    assert Enum.at(linked.newlink, 0).id == id_object
  end

  test "delete relationship" do
    id_subject = post_node().resp_body
    id_object = post_node(subject: id_subject).resp_body
    delete_link(id_subject, @default_predicate, id_object)
    response = query_node(id_subject, %{@default_predicate => %{}}) |> to_json
    assert response[@default_predicate] == nil
  end

  test "post and query with special characters in body" do
    id = post_node(predicate: @default_predicate, props: [body: @special_chars]).resp_body
    response = query_node(id, [body: true]) |> to_json
    assert response.body == @special_chars
  end

  test "post with special characters in predicate returns error" do
    response = post_node(predicate: @special_chars)
    assert response.status == 400
  end

  test "update node properties" do
    id_object1 = post_node().resp_body
    id_object2 = post_node().resp_body
    id_subject = post_node(links: [linksto: id_object1] ++ @default_links).resp_body
    update_node(id_subject, [body: "updated_body"], [linksto: id_object2], [linksto: id_object1])
    updated = query_node(id_subject, [body: true, linksto: %{}]) |> to_json
    assert updated.body == "updated_body"
    assert Enum.at(updated.linksto, 0).id == id_object2
  end

  defp post_node(options \\ []) do
    opts = default_opts(options)
    call_post("/graph/#{opts.subject}/#{opts.predicate}", [props: opts.props, links: opts.links])
  end

  defp post_link(options) do
    opts = default_opts(options)
    call_post("/graph/#{opts.subject}/#{opts.predicate}/#{opts.object}", [props: opts.props, links: opts.links])
  end

  defp default_opts(options) do
    defaults = [subject: @default_subject, predicate: @default_predicate, props: @default_props, links: @default_links]
    Keyword.merge(defaults, options) |> Enum.into(%{})
  end

  defp update_node(subject, props, links \\ [], removals \\ []) do
    call_post("/graph/#{subject}", %{"props" => props, "links" => links, "removals" => removals})
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
      200 -> Enum.at(response.resp_body |> Poison.decode!(keys: :atoms), 0)
      _ -> flunk response.resp_body
    end
  end
  
end
