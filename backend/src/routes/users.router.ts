import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import User from "../models/user";
import { RegisterDto } from "../interfaces/useractions.interfaces";
import * as bcrypt from "bcrypt";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body as RegisterDto;

    const checkUsernameExists = (await collections.users?.findOne<User>({ username: username })) as User;
    if (checkUsernameExists) return res.status(400).send(`User with username ${username} already exists`);

    const checkEmailExists = (await collections.users?.findOne<User>({ email: email })) as User;
    if (checkEmailExists) return res.status(400).send(`User with email ${email} already exists`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, username, passwordHash: hashedPassword } as User;

    const result = await collections.users?.insertOne(newUser);

    result
      ? res.status(201).send(`Successfully registered new user with id ${result.insertedId}`)
      : res.status(500).send("Failed to register user.");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
