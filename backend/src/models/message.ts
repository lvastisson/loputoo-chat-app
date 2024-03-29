import { ObjectId } from "mongodb";

export default class Message {
  constructor(
    public userId: string,
    public username: string,
    public message: string,
    public time: string,
    public _id?: ObjectId
  ) {}
}
