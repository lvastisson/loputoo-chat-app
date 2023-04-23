import express, { Application } from "express";
import { collections, connectToDatabase } from "./services/database.service";
import { messagesRouter } from "./routes/messages.router";
import { Server } from "socket.io";
import { usersRouter } from "./routes/users.router";
import { MessageDTO } from "./interfaces/Socket/message.intefaces";
import { statusRouter } from "./routes/status.router";
import { UserSession } from "./interfaces/session.interfaces";
import User from "./models/user";
import Message from "./models/message";
import http from "http";

declare global {
  namespace Express {
    export interface Request {
      session?: UserSession;
    }
  }
}

const API_PORT = parseInt(process.env.API_PORT as string) || 5000;

const app: Application = express();

const getTime = () => {
  return new Date().toISOString().split("T")[1].substring(0, 8);
};

const socketServer = (httpServer: http.Server) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("uus ühendus");

    socket.emit("hello", "ühendus olemas");

    socket.emit("message", `[${getTime()}] SERVER: ühendus loodud`);

    socket.on("message", async function (data: MessageDTO) {
      if (!data.token) return;

      const user = (await collections.users?.findOne<User>({ sessionId: data.token })) as User;
      if (!user) return;

      if (data.message.length > 0) {
        const newMessage = {
          userId: user._id || "null",
          username: user.username,
          message: data.message,
          time: getTime(),
        } as Message;
        const result = await collections.messages?.insertOne(newMessage);

        if (result) io.emit("message", `[${getTime()}] [${user.username}] ${data.message}`);
      }
    });

    socket.on("disconnect", function () {
      console.log("ühendus katkes");
    });
  });
};

connectToDatabase()
  .then(() => {
    app.use("/messages", messagesRouter);

    app.use("/users", usersRouter);

    app.use("/status", statusRouter);

    const httpServer = app.listen(API_PORT, () => {
      console.log(`Server jookseb URL'il: http://localhost:${API_PORT}`);
    });

    socketServer(httpServer);
  })
  .catch((error: Error) => {
    console.error("ERROR: andmebaasiga ühenduse loomine ebaõnnestus", error);
    process.exit();
  });
