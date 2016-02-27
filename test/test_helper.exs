ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Phoenixbin.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Phoenixbin.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Phoenixbin.Repo)

