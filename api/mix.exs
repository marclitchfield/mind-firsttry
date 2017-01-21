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
    [applications: [:cowboy, :logger, :plug, :httpoison],
     mod: {Api, []},
     env: [cowboy_port: 9000]]
  end

  defp deps do
  [{:cowboy, "~> 1.0.4"},
   {:httpoison, "~> 0.10.0"},
   {:atomic_map, "~> 0.8"},
   {:poison, "~> 3.0"},
   {:plug, "~> 1.2.2"},
   {:uuid, "~> 1.1"},
   {:apex, "~>0.7.0"}]
  end
end
