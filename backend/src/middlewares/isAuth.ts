import { Request, Response, NextFunction } from "express";
import { collections } from "../services/database.service";
import User from "../models/user";

export default async function (req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== "undefined") {
      const token = authHeader.split(" ");

      if (token[0] === "Bearer") {
        const user = (await collections.users?.findOne<User>({ sessionId: token[1] })) as User;

        if (user) {
          req.session = { sessionid: token[1], username: user.username, email: user.email, userid: user._id };
          next();
          return;
        }
      }
    }

    res.sendStatus(403);
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
}
