const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let streamerSocket = null;
let viewerSockets = [];

server.on('connection', socket => {
  console.log("Connection made: ", socket)
  socket.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'offer' && !streamerSocket) {
      streamerSocket = socket;
      viewerSockets.forEach(viewerSocket => viewerSocket.send(message));
    } else if (data.type === 'answer' && streamerSocket) {
      streamerSocket.send(message);
    } else if (data.type === 'candidate') {
      if (socket === streamerSocket) {
        viewerSockets.forEach(viewerSocket => viewerSocket.send(message));
      } else {
        streamerSocket.send(message);
      }
    }
  });

  socket.on('close', () => {
    if (socket === streamerSocket) {
      streamerSocket = null;
      viewerSockets = [];
    } else {
      viewerSockets = viewerSockets.filter(viewerSocket => viewerSocket !== socket);
    }
  });

  if (!streamerSocket) {
    streamerSocket = socket;
  } else {
    viewerSockets.push(socket);
  }
});
