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

    def mutate(quads) do
        mutations = Enum.join(quads, " .\n")
        query = "mutation { set { #{mutations} . } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: %{"code" => @success_code}}} = post("/query", query)
        :ok
    end

    def query_nodes(source, properties, predicates, child_predicates) do
        query(source, map_predicates(properties, predicates || [], child_predicates || []))
    end


    defp quad_object([node: name]), do: ~s(<#{name |> scrub}>)
    defp quad_object([text: text]), do: ~s("#{text |> scrub}")

    defp scrub(atom) when is_atom(atom), do: atom
    defp scrub(string) do
        string |> String.replace(~s(\\), ~s()) |> String.replace(~s("), ~s(\\"))
    end

    defp query(xid, terms) do
        query = "{ me(_xid_: #{xid}) { #{terms} } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: body}} = post("/query", query)
        {:ok, body}
    end
    
    # TODO: scrub inputs
    defp map_predicates(properties, predicates, child_predicates) do
        "#{properties |> string_list} " <> 
            (predicates
                |> Enum.map(fn(pred) -> "#{pred} { #{map_predicates(properties, child_predicates, [])} }" end) 
                |> string_list)
    end

    defp string_list(terms) do
        terms |> Enum.join(" ")
    end

end
