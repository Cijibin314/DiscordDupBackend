const http = require('http');
const ws = require('ws');
// const {Message, toJSON} = require('../frontend/js/message.js');
// const {Interaction} = require('../frontend/js/interaction.js');
// const fetcher = require("./interactions/fetchData.js")
const helper = require("./serverHelper.js")
const {connectedUsers} = require("./connectedUsers.js")
//webserver
const wss = new ws.Server({ noServer: true });

function accept(req, res) {
  // all incoming requests must be websockets
  if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
    res.end();
    return;
  }

  // can be Connection: keep-alive, Upgrade
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    res.end();
    return;
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}
function onConnect(ws) {
  console.log("connected")
  ws.once('message', (username) => {
    username = username.toString()
    console.log("Received opening username: ", username)
    connectedUsers.add(username, ws);
    console.log(`User connected: ${username}`);
    console.log("New list of connected Users: ", connectedUsers.get())
    

    // Listen for further messages
    ws.on('message', (buffer) => {
      JSONInteraction = buffer.toString()
      JSONInteraction = JSON.parse(JSONInteraction)
      helper.handleResponse(ws, JSONInteraction)
    });

    ws.on('close', () => {
      console.log(`User disconnected: ${username}`);
      connectedUsers.remove(username);
      console.log("New list of connected Users: ", connectedUsers.get())
    });
  });
}

if (!module.parent) {
  http.createServer(accept).listen(process.env.PORT || 8081);
} else {
  exports.accept = accept;
}
