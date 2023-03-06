import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Message from "../models/message";

export const messagesRouter = express.Router();

messagesRouter.use(express.json());

messagesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const messages = (await collections.messages?.find<Message>({}).toArray()) as Message[];

    res.status(200).send(messages);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

messagesRouter.post("/", async (req: Request, res: Response) => {
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
