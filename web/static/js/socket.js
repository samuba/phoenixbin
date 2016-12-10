// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel           = socket.channel("rooms:" + pageId, {})
let messagesContainer = $(".requests")

channel.on("new_msg", payload => {
  console.log("incoming for: " + pageId, payload)
  let date = new Date().toISOString()
  let html = `
    <div class="request shadow-7 br2 br--bottom mt4" hidden>
      <div class="br2 br--top bg-orange h2 pa2 white tc f5">
        <span class="fl w-10 b">${payload.method}</span>
        <span class="fl w-40">on ${payload.url}</span>
        <span class="fl w-20">from ${payload.remote_ip}</span>
        <span class="fl w-30">at ${date.split("T")[1].substr(0, 8)} ${date.split("T")[0]}</span>
      </div>

       <div class="flex justify-between f6">
        <div class="w-50">
          <ul class="list pl3">
            <li class="mt3">
              <span class="underline">Body Params</span>#body_params_placeholder#
            </li>
            <li class="mt3">
              <span class="underline">Query Params</span>#query_params_placeholder#
            </li>
            <li class="mt3">
              <span class="underline">Body</span>
              ${ payload.body ? '<textarea readonly class="mt2 ml2 db pa2 br2 b--light-silver w-90 shadow-inset bg-light-gray" rows="6">' + payload.body + '</textarea>' : constructTableRows(null) }
            </li>
          </ul>
        </div>

        <div class="w-50">
          <ul class="list pl3">
            <li class="mt3">
              <span class="underline">Headers</span>#headers_placeholder#
            </li>
          </ul>
        </div>
       </div>
     </div>` 

  html = html.replace("#headers_placeholder#", constructTableRows(payload.headers))
  html = html.replace("#query_params_placeholder#", constructTableRows(payload.query_params))
  html = html.replace("#body_params_placeholder#", constructTableRows(payload.body_params))

  messagesContainer.prepend(html)
  $(".request").slideDown("fast", () => {});
})

channel.join()
  .receive("ok", resp => { console.log(`Joined successfully: "${pageId}"`, resp) })
  .receive("error", resp => { console.error(`Unable to join: "${pageId}"`, resp) })

function constructTableRows(list) {
  if (!list || list.length <= 0) return '<span class="silver mt1 ml2 db">empty<span>'
  let rows = '<ul class="list mt1 pl0 ml2">';
  list.forEach(x => rows += `<li class="mt1"><b>${x[0]}</b> ${x[1]}</li>`)
  return rows + '</ul>';
}

export default socket
