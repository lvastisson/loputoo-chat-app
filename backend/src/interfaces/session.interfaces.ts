import { ObjectId } from "mongodb";

export interface UserSession {
  sessionid?: string;
  username?: string;
  email?: string;
  userid?: ObjectId;
}
