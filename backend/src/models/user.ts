import { ObjectId } from "mongodb";

export default class User {
  constructor(
    public userName: string,
    public email: number,
    public passwordHash: string,
    public sessionId?: string,
    public id?: ObjectId
  ) {}
}
