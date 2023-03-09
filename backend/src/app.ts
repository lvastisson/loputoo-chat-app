import express, { Application } from "express";
import { connectToDatabase } from "./services/database.service";
import { messagesRouter } from "./routes/messages.router";
import { Server } from "socket.io";
// import { createServer } from "http";
// import {
//   ClientToServerEvents,
//   ServerToClientEvents,
//   InterServerEvents,
//   SocketData,
// } from "./interfaces/socketio.interfaces";

const app: Application = express();

// const server = createServer(app);
// const io = new Server(server);

const io = new Server(8888);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.emit("hello", "ühendus olemas");

  socket.emit("message", "[server] ühendus loodud");

  socket.on("message", function (data) {
    io.emit("message", data);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

const port = 5000;

connectToDatabase()
  .then(() => {
    app.use("/messages", messagesRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);

      // io.on("connection", (socket) => {
      //   console.log("user connected");

      //   socket.emit("hello", "ühendus olemas");

      //   socket.on("disconnect", function () {
      //     console.log("user disconnected");
      //   });
      // });
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
