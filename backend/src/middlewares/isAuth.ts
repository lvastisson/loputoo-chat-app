import { Request, Response, NextFunction } from "express";
import { collections } from "../services/database.service";
import User from "../models/user";

export default async function(req: Request, res: Response, next: NextFunction) {
  try {    
    const authHeader = req.headers.authorization;
  
    let debug = "";

    if (typeof authHeader !== 'undefined') {
      const token = authHeader.split(' ');

      debug += "auth,";
      
      if (token[0] === 'Bearer') {
        debug += "bearer,";
        const user = (await collections.users?.findOne<User>({ sessionId: token[1] })) as User;
  
        if (user) {
          req.session = { sessionid: token[1], username: user.username, email: user.email };
          next();
        }
      }
    }
    
    res.status(403).send(debug);
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
}