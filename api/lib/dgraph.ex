defmodule Dgraph do
    use HTTPoison.Base

    def process_url(url) do
        Application.get_env(:api, :dgraph_url) <> url
    end

    def process_response_body(body) do
        body |> Poison.decode!
    end

    def mutate() do
        {:ok, %HTTPoison.Response{body: %{"code" => "ErrorOk"}}} = post("/query", """
        mutation {
            set {
                <self> <type> <being> .
                <idea> <type> <concept> .
                <idea> <label> "Idea" .
                <self> <has.concept> <idea-1> .
                <idea-1> <type> <idea> .
                <idea-1> <body> "I think" .
            }
        }
        """)
        :ok
    end

    def query() do
        {:ok, %HTTPoison.Response{body: body}} = post("/query", """
        {
            me(_xid_: self) {
                type { label }
                has.concept {
                    type { label }
                    body
                }
            }
        }
        """)
        body
    end
end
