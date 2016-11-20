defmodule Dgraph do
    use HTTPoison.Base
    @success_code "ErrorOk"

    def process_url(url) do
        Application.get_env(:api, :dgraph_url) <> url
    end

    def process_response_body(body) do
        body |> Poison.decode!
    end

    def quad(subject, predicate, object) do
        "<#{subject}> <#{predicate}> " <> quad_object(object)
    end

    def quad_object([node: name]), do: "<#{name}>"
    def quad_object([text: text]), do: "\"#{text}\""

    def mutate(quads) do
        query = "mutation { set { " <> Enum.join(quads, " . \n") <> " . } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: %{"code" => @success_code}}} = post("/query", query)
        :ok
    end

    def query(xid, terms) do
        query = "{ me(_xid_: #{xid}) { #{terms} } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: body}} = post("/query", query)
        body
    end
end
