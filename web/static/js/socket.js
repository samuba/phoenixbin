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
let messagesContainer = $(".requests_messages")

channel.on("new_msg", payload => {
  console.log("incoming for: " + pageId, payload)
  let date = new Date();
  let html = `<br/>
     <div class="panel panel-primary" hidden>
       <div class="panel-heading">
        <div class="row">
          <div class="col-xs-1"><span class="request_method">${payload.method}</span></div>
          <div class="col-xs-5">on ${payload.url}</div>
          <div class="col-xs-2">from ${payload.remote_ip}</div>
          <div class="col-xs-4"><span class="request_time">at ${moment().format('DD.MM.YYYY HH:mm:ss')}</span></div>
        </div>
       </div>

       <div class="panel-body">
        <div class="row">
          <div class="col-sm-6">
            <ul class="property-list">
              <li class="request_property">
                <span class="property_title">Body Params</span>#body_params_placeholder#
              </li>
              <li class="request_property">
                <span class="property_title">Query Params</span>#query_params_placeholder#
              </li>
              <li class="request_property">
                <span class="property_title">Body</span>
                ${ payload.body ? '<textarea readonly class="body-box form-control" rows="5">' + payload.body + '</textarea>' : '<span class="property_empty">empty<span>' }
              </li>
            </ul>
          </div>
          <div class="col-sm-6">
            <ul class="property-list">
              <li class="request_property">
                <span class="property_title">Headers</span>#headers_placeholder#
              </li>
              <li class="request_property">
                <span class="property_title">Cookies</span>#cookies_placeholder#
              </li>       
            </ul>
          </div>
        </div>
       </div>
     </div>`

  html = html.replace("#headers_placeholder#", constructTableRows(payload.headers))
  html = html.replace("#cookies_placeholder#", constructTableRows(payload.cookies))
  html = html.replace("#query_params_placeholder#", constructTableRows(payload.query_params))
  html = html.replace("#body_params_placeholder#", constructTableRows(payload.body_params))

  messagesContainer.prepend(html)
  $(".panel-primary").slideDown("medium", () => {});
})

channel.join()
  .receive("ok", resp => { console.log(`Joined successfully: "${pageId}"`, resp) })
  .receive("error", resp => { console.error(`Unable to join: "${pageId}"`, resp) })

function constructTableRows(list) {
  if (!list || list.length <= 0) return '<span class="property_empty">empty<span>'
  let rows = '<ul class="inner-list">';
  list.forEach(x => rows += `<li><b>${x[0]}</b> ${x[1]}</li>`)
  return rows + '</ul>';
}

export default socket
