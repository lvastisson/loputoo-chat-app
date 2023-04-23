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
import { startSocketServer } from "./services/socketServer.service";

declare global {
  namespace Express {
    export interface Request {
      session?: UserSession;
    }
  }
}

const API_PORT = parseInt(process.env.API_PORT as string) || 5000;

const app: Application = express();

connectToDatabase()
  .then(() => {
    app.use("/messages", messagesRouter);

    app.use("/users", usersRouter);

    app.use("/status", statusRouter);

    const httpServer = app.listen(API_PORT, () => {
      console.log(`Server jookseb URL'il: http://localhost:${API_PORT}`);
    });

    startSocketServer(httpServer);
  })
  .catch((error: Error) => {
    console.error("ERROR: andmebaasiga ühenduse loomine ebaõnnestus", error);
    process.exit();
  });
