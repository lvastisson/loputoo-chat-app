import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Message from "../models/message";
import isAuth from "../middlewares/isAuth";

export const messagesRouter = express.Router();

messagesRouter.use(express.json());

messagesRouter.get("/", isAuth, async (req: Request, res: Response) => {
  try {
    const messagesToLoad = 100;
    const messageCount = await collections.messages?.countDocuments();
    // get only last N messages
    const messages = (await collections.messages
      ?.find<Message>({})
      .skip(messageCount || 0 < messagesToLoad ? 0 : messageCount || messagesToLoad - messagesToLoad)
      .toArray()) as Message[];

    const parsedMessages = messages.map((el) => {
      return `[${el.time}] [${el.username}] ${el.message}`;
    });

    res.status(200).send(parsedMessages);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

messagesRouter.post("/", isAuth, async (req: Request, res: Response) => {
  try {
    const newMessage = { ...req.body, userId: req.session?.userid, username: req.session?.username } as Message;
    const result = await collections.messages?.insertOne(newMessage);

    result
      ? res.status(201).send(`Edukalt lisatud uus sõnum ID'ga ${result.insertedId}`)
      : res.status(500).send("Uue sõnumi lisamine ebaõnnestus");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
