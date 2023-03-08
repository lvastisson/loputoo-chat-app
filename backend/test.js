var app = require("http").createServer(handler);
var io = require("socket.io")(app); // we'll listen on the app's port
var fs = require("fs");

app.listen(5000);
io.sockets.on("connection", onConnect);

var htmlPage = "bbbTemp.html";
function handler(req, res) {
  fs.readFile(htmlPage, function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading file: " + htmlPage);
    }
    res.writeHead(200);
    res.end(data);
  });
}

function onConnect(socket) {
  console.log("Connected");
}
