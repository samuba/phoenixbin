defmodule Phoenixbin.HomeController do
  use Phoenixbin.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
