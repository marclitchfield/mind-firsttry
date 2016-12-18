defmodule ApiTest do
  use ExUnit.Case
  use Plug.Test
  alias MindRouter, as: Router
  doctest Api
  @opts Router.init([])
  @special_chars ~s(sq:' dq:" bs:\\ # lb:} rb:{ amp:&)

  test "post node with properties" do
    id = post_node(props: [prop: "value"])
    response = query_graph(id, [prop: true, "created.at": true])
    assert response.id != nil
    assert response[:"created.at"] != nil
    assert response.prop == "value"
  end

  test "post node with link to other node" do
    target = post_node()
    source = post_node(out: [to: target])
    response = query_graph(source, [to: %{}])
    assert hd(response.to).id == target
  end

  test "post node with link from other node" do
    source = post_node()
    target = post_node(in: [to: source])
    response = query_graph(source, [to: %{}])
    assert hd(response.to).id == target
  end

  test "update and insert properties for existing node" do
    id = post_node(props: [prop1: "value"])
    post_graph(%{ id => [props: [prop1: "updated", prop2: "inserted"]]})
    response = query_graph(id, [prop1: true, prop2: true])
    assert response.prop1 == "updated"
    assert response.prop2 == "inserted"
  end

  test "post node with links between another node" do
    source = post_node()
    target = post_node(in: [to: source], out: [from: source])
    response = query_graph(source, [to: [from: %{}]])
    assert hd(response.to).id == target
    assert hd(hd(response.to).from).id == source
  end

  test "insert links between existing nodes" do
    source = post_node()
    target = post_node()
    post_graph(%{ source => [out: [to: target]], target => [out: [from: source]] })
    response = query_graph(source, [to: [from: %{}]])
    assert hd(response.to).id == target
    assert hd(hd(response.to).from).id == source
  end

  test "delete existing node links" do
    target = post_node()
    source = post_node(out: [to: target], in: [from: target])
    post_graph(%{ source => [del: [out: [to: target], in: [from: target]]] })
    response = query_graph(source, [to: [from: %{}]])
    assert Map.has_key?(response, :to) == false
  end

  test "delete existing node properties" do
    id = post_node(props: [delete_me: "value"])
    post_node(id, del: [props: [delete_me: "value"]])
    response = query_graph(id, [delete_me: true])
    assert Map.has_key?(response, :delete_me) == false
  end

  test "update link between existing nodes" do
    source = post_node()
    target1 = post_node(in: [to: source])
    target2 = post_node()
    post_graph(%{ source => [out: [to: target2], del: [out: [to: target1]]] })
    response = query_graph(source, [to: %{}])
    assert hd(response.to).id == target2
  end

  test "post and query with special characters in body" do
    id = post_node(props: [body: @special_chars])
    response = query_graph(id, [body: true])
    assert response.body == @special_chars
  end

  test "post with special characters in link returns error" do
    source = post_node()
    resp = call_post("/node", [out: %{ @special_chars => source }])
    assert resp.status == 400
  end

  defp post_node(opts \\ []) do
    call_post_assert("/node", opts)
  end

  defp post_node(id, opts) do
    call_post_assert("/node/#{id}", opts)
  end

  defp post_graph(mutations) do
    call_post_assert("/graph", mutations)
  end

  defp query_graph(id, query) do
    call_post_assert("/query/#{id}", query) |> to_json
  end

  defp call_post_assert(url, payload) do
    response = call_post(url, payload)
    assert response.status == 200
    response.resp_body
  end

  defp call_post(url, payload) do
    conn(:post, url, payload) 
      |> put_req_header("content-type", "application/json")
      |> Router.call(@opts)
  end

  defp to_json(body) do
    body |> Poison.decode!(keys: :atoms)
  end
  
end
