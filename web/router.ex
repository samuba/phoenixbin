defmodule Phoenixbin.Router do
  use Phoenixbin.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Phoenixbin do
    pipe_through :browser # Use the default browser stack

    get "/",            HomeController, :index
    get "/generate",    MainController, :generate
    get "/:id/inspect", MainController, :inspect

    get     "/:id", MainController, :request
    put     "/:id", MainController, :request
    post    "/:id", MainController, :request 
    patch   "/:id", MainController, :request 
    delete  "/:id", MainController, :request     
    options "/:id", MainController, :request
    connect "/:id", MainController, :request
    trace   "/:id", MainController, :request
    head    "/:id", MainController, :request
  end

  # Other scopes may use custom stacks.
  # scope "/api", Phoenixbin do
  #   pipe_through :api
  # end
end
