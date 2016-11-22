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

    def delete(quads) do
        deletions = Enum.join(quads, " .\n")
        query = "mutation { delete { #{deletions} . } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: %{"code" => @success_code}}} = post("/query", query)
        :ok
    end

    def query(xid, request) do
        query = "{ me(_xid_: #{xid}) { " <> query_expression(request) <> " } }"
        IO.puts(query)
        {:ok, %HTTPoison.Response{body: body}} = post("/query", query)
        {:ok, body}
    end

    defp query_expression(request) do
        "_xid_ " <> (request |> Enum.map(fn {k, v} -> query_term(k, v) end) |> Enum.join(" "))
    end

    defp query_term(property, value) do
        cond do
            is_map(value) -> "#{property} { " <> query_expression(value) <> " }"
            value -> "#{property}"
            true -> ""
        end        
    end

    defp quad_object([node: name]), do: ~s(<#{name |> scrub}>)
    defp quad_object([text: text]), do: ~s("#{text |> scrub}")

    defp scrub(atom) when is_atom(atom), do: atom
    defp scrub(string) do
        string |> String.replace(~s(\\), ~s()) |> String.replace(~s("), ~s(\\"))
    end

end
