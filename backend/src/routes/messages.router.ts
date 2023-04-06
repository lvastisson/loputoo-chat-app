import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Message from "../models/message";
import isAuth from "../middlewares/isAuth";

export const messagesRouter = express.Router();

messagesRouter.use(express.json());

messagesRouter.get("/", isAuth, async (req: Request, res: Response) => {
  try {
    const messages = (await collections.messages?.find<Message>({}).toArray()) as Message[];

    res.status(200).send({ messages, session: req.session });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

messagesRouter.post("/", isAuth, async (req: Request, res: Response) => {
  try {
    const newMessage = req.body as Message;
    const result = await collections.messages?.insertOne(newMessage);

    result
      ? res.status(201).send(`Successfully created a new message with id ${result.insertedId}`)
      : res.status(500).send("Failed to create a new message.");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
