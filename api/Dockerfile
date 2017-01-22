FROM msaraiva/elixir-dev

WORKDIR .
ADD . .
RUN mix deps.get
RUN mix compile

ENV PORT 9000

ENTRYPOINT mix run --no-halt
