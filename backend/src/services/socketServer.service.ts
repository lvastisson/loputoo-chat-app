import { collections, connectToDatabase } from "../services/database.service";
import { Server } from "socket.io";
import { MessageDTO } from "../interfaces/Socket/message.intefaces";
import User from "../models/user";
import Message from "../models/message";
import http from "http";

const getTime = () => {
  return new Date().toISOString().split("T")[1].substring(0, 8);
};

export function startSocketServer(httpServer: http.Server) {
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
}
