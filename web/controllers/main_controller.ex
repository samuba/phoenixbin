defmodule Phoenixbin.MainController do
  use Phoenixbin.Web, :controller

  def generate(conn, _params) do
    conn |> redirect(to: "/#{SecureRandom.urlsafe_base64(6)}/inspect")
    conn |> resp(200, "ok")
  end

  def inspect(conn, %{"id" => id}) do
    render conn, "index.html", id: id
  end

  def request(conn, %{"id" => id}) do
    Phoenixbin.Endpoint.broadcast("rooms:#{id}", "new_msg", %{
      body:         conn |> get_body,
      url:          conn |> get_url,
      remote_ip:    conn |> get_remote_ip,
      headers:      conn |> get_headers_as_lists,
      method:       conn.method,
      body_params:  conn.body_params  |> map_to_lists,
      query_params: conn.query_params |> map_to_lists,
      cookies:      conn.cookies      |> map_to_lists,
    })

    conn 
    |> put_resp_header("Access-Control-Allow-Origin", "*")
    |> resp(200, "ok")
  end

  defp get_url(conn) do
    query = case conn.query_string do
      "" -> ""
      _ -> "?#{conn.query_string}"
    end
    host = Enum.find(conn.req_headers, &(elem(&1, 0) == "host")) |> elem(1)
    "#{host}#{conn.request_path}#{query}"
  end

  defp get_remote_ip(conn) do
     conn.remote_ip
     |> Tuple.to_list
     |> Enum.reduce(fn x, acc -> to_string(acc) <> "." <> to_string(x) end)
  end

  defp get_body(conn) do
    {:ok, body, _} = read_body(conn)
    body
  end

  defp get_headers_as_lists(conn) do
    conn.req_headers
    |> Enum.take_while(fn x -> elem(x, 0) != "cookie" end)
    |> Enum.map(&Tuple.to_list &1)
  end

  defp map_to_lists(maps) do
    maps
    |> unfetched_to_empty
    |> Map.to_list
    |> Enum.map(&Tuple.to_list &1)
  end

  defp unfetched_to_empty(var) do
    case var do
      %Plug.Conn.Unfetched{aspect: :body_params} -> %{}
      _ -> var
    end
  end
end
