import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import User from "../models/user";
import { LoginDto, RegisterDto } from "../interfaces/API/useractions.interfaces";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import isAuth from "../middlewares/isAuth";

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

usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginDto;

    const user = (await collections.users?.findOne<User>({ email: email })) as User;
    if (!user) return res.status(400).send(`User with email ${email} doesn't exist`);

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return res.status(400).send("Wrong password");

    const generatedRandomID = crypto.randomBytes(8).toString("hex");

    const result = await collections.users?.updateOne(
      { _id: new ObjectId(user.id) },
      { $set: { sessionId: generatedRandomID } }
    );

    result
      ? res.status(201).send(`Successfully generated session for user ${user.username} with id ${generatedRandomID}`)
      : res.status(500).send("Failed to generate session");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

usersRouter.post("/logout", isAuth, async (req: Request, res: Response) => {
  try {
    const user = (await collections.users?.findOne<User>({ sessionId: req.session?.sessionid })) as User;
    if (!user) return res.status(400).send(`Session doesn't exist`);

    const result = await collections.users?.updateOne(
      { _id: new ObjectId(user.id) },
      { $set: { sessionId: '' } }
    );

    result
      ? res.status(201).send(`Successfully logged out user ${user.username} with id ${user.sessionId}`)
      : res.status(500).send("Failed to logout");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
