import { ObjectId } from "mongodb";

export default class Message {
  constructor(public userId: string, public message: string, public time: string, public id?: ObjectId) {}
}
