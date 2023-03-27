import express, { Application } from "express";
import { connectToDatabase } from "./services/database.service";
import { messagesRouter } from "./routes/messages.router";
import { Server } from "socket.io";
import { usersRouter } from "./routes/users.router";
import { MessageDTO } from "./interfaces/Socket/message.intefaces";
import { statusRouter } from "./routes/status.router";

const API_PORT = parseInt(process.env.API_PORT as string) || 5000;

const app: Application = express();

const getTime = () => {
  return new Date().toISOString().split("T")[1].substring(0, 8);
};

connectToDatabase()
  .then(() => {
    app.use("/messages", messagesRouter);

    app.use("/users", usersRouter);

    app.use("/status", statusRouter);

    const httpServer = app.listen(API_PORT, () => {
      console.log(`Server started at http://localhost:${API_PORT}`);
    });

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
      console.log("user connected");

      socket.emit("hello", "ühendus olemas");

      socket.emit("message", `[${getTime()}] SERVER: ühendus loodud`);

      socket.on("message", function (data: MessageDTO) {
        if (data.message.length > 0) io.emit("message", `[${getTime()}] [${data.name}] ${data.message}`);
      });

      socket.on("disconnect", function () {
        console.log("user disconnected");
      });
    });
  })
  .catch((error: Error) => {
    console.error("ERROR: Database connection failed", error);
    process.exit();
  });
