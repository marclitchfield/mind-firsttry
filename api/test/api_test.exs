defmodule ApiTest do
  use ExUnit.Case
  use Plug.Test
  alias MindRouter, as: Router
  doctest Api
  @opts Router.init([])
  @test_body "Test Node Body"
  @test_node_type "concept"
  @test_predicate "pred"

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
    response = post_node(id)
    assert response.status == 200
  end

  test "get node by id" do
    id = post_node().resp_body
    response = get_node(id)
    assert response["me"]["_xid_"] == id
    assert response["me"]["body"] == @test_body
  end

  test "get related nodes" do
    id_subject = post_node().resp_body
    id_object = post_node(id_subject).resp_body
    response = get_node(id_subject, [@test_predicate])
    assert response["me"]["_xid_"] == id_subject
    assert response["me"][@test_predicate]["_xid_"] == id_object
  end


  defp post_node() do
    call_post("/nodes/rel", [type: @test_node_type, body: @test_body])
  end

  defp post_node(id) do
    call_post("/nodes/rel", [type: @test_node_type, body: @test_body, subject: id, predicate: @test_predicate])
  end

  defp get_node(id) do
    call_get("/node/#{id}").resp_body |> Poison.decode!
  end

  defp get_node(id, predicates) do
    pred_args = predicates |> Enum.map(fn p -> "p[]=#{p}" end) |> Enum.join("&")
    call_get("/node/#{id}?#{pred_args}").resp_body |> Poison.decode!
  end

  defp call_get(url) do
    conn(:get, url) |> Router.call(@opts)
  end

  defp call_post(url, payload \\ nil) do
    conn(:post, url, payload) 
      |> put_req_header("content-type", "application/json")
      |> Router.call(@opts)
  end
  
end
