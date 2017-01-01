defmodule ElasticSearch do

  def index(facet, id, source) do
    url = Application.get_env(:api, :elastic_url)
    index = Application.get_env(:api, :elastic_index)
    IO.inspect {:elasticsearch_index_request, facet, source}

    case Elastix.Document.index(url, index, facet, id, source) do
      %HTTPoison.Response{body: %{"error" => err}} -> {:error, err}
      response -> {:ok, response}
    end
  end

  def search(facet, query) do
    url = Application.get_env(:api, :elastic_url)
    index = Application.get_env(:api, :elastic_index)
    request = %{ query: %{ prefix: query } }
    IO.inspect {:elasticsearch_search_request, request}

    case Elastix.Search.search(url, index, [facet], request) do
      %HTTPoison.Response{body: %{"error" => err}} -> {:error, err}
      %HTTPoison.Response{body: %{"hits" => %{"hits" => hits}}} -> {:ok, Enum.map(hits, fn hit -> hit["_source"] end)}
    end
  end

end