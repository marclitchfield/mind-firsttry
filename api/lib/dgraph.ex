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

    # TODO: scrub inputs
    def quad_object([node: name]), do: "<#{name}>"
    def quad_object([text: text]), do: "\"#{text}\""

    def mutate(quads) do
        query = "mutation { set { " <> Enum.join(quads, " .\n") <> " . } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: %{"code" => @success_code}}} = post("/query", query)
        :ok
    end

    def query(xid, terms) do
        query = "{ me(_xid_: #{xid}) { #{terms} } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: body}} = post("/query", query)
        {:ok, body}
    end

    def query_nodes(source, properties, predicates, child_predicates) do
        query(source, map_predicates(properties, predicates, child_predicates))
    end
    
    # TODO: scrub inputs
    # TODO: Fix problem selecting node without predicates; doesn't return props
    def map_predicates(properties, predicates, child_predicates) do
        "#{properties |> string_list} " <> 
            (predicates 
                |> Enum.map(fn(pred) -> "#{pred} { #{map_predicates(properties, child_predicates, [])} }" end) 
                |> string_list)
    end

    def string_list(terms) do
        terms |> Enum.join(" ")
    end

end
