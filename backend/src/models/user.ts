import { ObjectId } from "mongodb";

export default class User {
  constructor(
    public username: string,
    public email: string,
    public passwordHash: string,
    public sessionId?: string,
    public id?: ObjectId
  ) {}
}
