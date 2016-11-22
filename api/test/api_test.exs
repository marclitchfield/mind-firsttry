defmodule ApiTest do
  use ExUnit.Case
  use Plug.Test
  alias MindRouter, as: Router
  doctest Api
  @opts Router.init([])
  @test_subject "Tests"
  @test_predicate "pred"
  @test_object_type "concept"
  @test_body "Test Node Body"

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
    response = post_related_node(id)
    assert response.status == 200
  end

  test "get node by id" do
    id = post_node().resp_body
    response = query_node(id, %{"body" => true}) |> to_json
    assert response["me"]["_xid_"] == id
    assert response["me"]["body"] == @test_body
  end

  test "get related nodes" do
    id_subject = post_node().resp_body
    id_object = post_related_node(id_subject).resp_body
    response = query_node(id_subject, %{@test_predicate => %{}}) |> to_json
    assert response["me"]["_xid_"] == id_subject
    assert response["me"][@test_predicate]["_xid_"] == id_object
  end

  test "delete relationship" do
    id_subject = post_node().resp_body
    id_object = post_related_node(id_subject).resp_body
    delete_link(id_subject, @test_predicate, id_object)
    response = query_node(id_subject, %{@test_predicate => %{}}) |> to_json
    assert response["me"][@test_predicate] == nil
  end

  defp post_node() do
    call_post("/nodes/#{@test_subject}/#{@test_predicate}", [is: @test_object_type, body: @test_body])
  end

  defp post_related_node(id) do
    call_post("/nodes/#{id}/#{@test_predicate}", [is: @test_object_type, body: @test_body])
  end

  defp query_node(id, query \\ %{}) do
    call_post("/query/#{id}", query)
  end

  defp delete_link(subject, predicate, object) do
    call_delete("/node/#{subject}/#{predicate}/#{object}")
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
    response.resp_body |> Poison.decode!
  end
  
end
