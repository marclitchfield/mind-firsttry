defmodule ElasticSearch do
  use HTTPoison.Base

  def process_url(url) do
    Application.get_env(:api, :elastic_url) <> url
  end

  def process_request_body(body), do: body |> Poison.encode!

  def process_response_body(body) do
    IO.inspect {:elasticsearch_response, body |> Poison.decode!}
    body |> Poison.decode! 
  end

  def index(facet, id, source) do
    index = Application.get_env(:api, :elastic_index)
    url = "/#{index}/#{facet}/#{id}/_update"
    request = %{"doc" => source, "doc_as_upsert" => true}
    IO.inspect {:elasticsearch_request, url, request}

    case post(url, request) do
      {:ok, %HTTPoison.Response{body: %{"error" => err}}} -> {:error, err}
      response -> response
    end
  end

  import IEx
  def search(facet, fields, query) do
    index = Application.get_env(:api, :elastic_index)
    url = "/#{index}/#{facet}/_search"
    request = %{ 
      query: %{ 
        query_string: %{ 
          "fields" => fields,
          "query" => query
        }
      }
    }
    IO.inspect {:elasticsearch_request, url, request}

    case post(url, request) do
      {:ok, %HTTPoison.Response{body: %{"error" => err}}} -> {:error, err}
      {:ok, %HTTPoison.Response{body: %{"hits" => %{"hits" => hits}}}} -> {:ok, Enum.map(hits, &build_hit(&1))}
    end
  end

  defp build_hit(hit), do: Map.merge(%{id: hit["_id"]}, hit["_source"])

end