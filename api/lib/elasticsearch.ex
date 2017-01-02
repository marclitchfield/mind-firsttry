defmodule ElasticSearch do
  use HTTPoison.Base
  @index Application.get_env(:api, :elastic_index)

  def process_url(url) do
    Application.get_env(:api, :elastic_url) <> url
  end

  def process_request_body(body), do: body |> Poison.encode!

  def process_response_body(body) do
    IO.inspect {:elasticsearch_response, body |> Poison.decode!}
    body |> Poison.decode! 
  end

  def index(facet, id, source) do
    url = "/#{@index}/#{facet}/#{id}/_update"
    request = %{"doc" => source, "doc_as_upsert" => true}
    IO.inspect {:elasticsearch_request, "POST", url, request}
    case post(url, request) do
      {:ok, %HTTPoison.Response{body: %{"error" => err}}} -> {:error, err}
      response -> response
    end
  end

  def search(facet, query) do
    url = "/#{@index}/#{facet}/_search"
    request = %{ query: %{ match_phrase_prefix: query } }
    IO.inspect {:elasticsearch_request, "POST", url, request}
    case post(url, request) do
      {:ok, %HTTPoison.Response{body: %{"error" => err}}} -> {:error, err}
      {:ok, %HTTPoison.Response{body: %{"hits" => %{"hits" => hits}}}} -> {:ok, Enum.map(hits, &build_hit(&1))}
    end
  end
  
  def delete(facet, id) do
    url = "/#{@index}/#{facet}/#{id}"
    IO.inspect {:elasticsearch_request, "DELETE", url}
    delete(url)
  end

  defp build_hit(hit), do: Map.merge(%{id: hit["_id"]}, hit["_source"])

end