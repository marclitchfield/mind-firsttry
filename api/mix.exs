defmodule Api.Mixfile do
  use Mix.Project

  def project do
    [app: :api,
     version: "0.1.0",
     elixir: "~> 1.3",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps()]
  end

  def application do
    [applications: [:cowboy, :logger, :plug],
     mod: {Api, []},
     env: [cowboy_port: 5000]]
  end

  defp deps do
  [{:cowboy, "~> 1.0.4"},
   {:plug, "~> 1.2.2"}]
  end
end
