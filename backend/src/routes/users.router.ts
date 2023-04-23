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
    if (checkUsernameExists) return res.status(400).send({ message: `Nimi ${username} on juba kasutusel` });

    const checkEmailExists = (await collections.users?.findOne<User>({ email: email })) as User;
    if (checkEmailExists) return res.status(400).send({ message: `Meil ${email} on juba kasutusel` });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, username, passwordHash: hashedPassword } as User;

    const result = await collections.users?.insertOne(newUser);

    result
      ? res.status(201).send({ message: `Edukalt registreeritud uus kasutaja ID'ga ${result.insertedId}` })
      : res.status(500).send({ message: "Registreerumine ebaõnnestus" });
  } catch (error: any) {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});

usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginDto;

    const user = (await collections.users?.findOne<User>({ email: email })) as User;
    if (!user) return res.status(400).send({ message: `${email} meiliga kasutajat ei eksisteeri` });

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return res.status(400).send({ message: "Valed andmed" });

    const generatedRandomID = crypto.randomBytes(8).toString("hex");

    const result = await collections.users?.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { sessionId: generatedRandomID } }
    );

    result
      ? res.status(201).send({
          message: `Sessioon avatud kasutajale ${user.username} ID'ga ${generatedRandomID}`,
          token: generatedRandomID,
        })
      : res.status(500).send({ message: "Sessiooni avamine ebaõnnestus" });
  } catch (error: any) {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});

usersRouter.post("/logout", isAuth, async (req: Request, res: Response) => {
  try {
    const user = (await collections.users?.findOne<User>({ sessionId: req.session?.sessionid })) as User;
    if (!user) return res.status(400).send({ message: "Sessiooni ei eksisteeri" });

    const result = await collections.users?.updateOne({ _id: new ObjectId(user._id) }, { $set: { sessionId: "" } });

    result
      ? res.status(201).send({ message: `Edukalt välja logitud kasutaja ${user.username} ID'ga ${user.sessionId}` })
      : res.status(500).send({ message: "Väljalogimine ebaõnnestus" });
  } catch (error: any) {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});
