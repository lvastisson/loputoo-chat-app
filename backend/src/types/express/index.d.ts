import { UserSession } from "../../interfaces/session.interfaces"

// to make the file a module and avoid the TypeScript error
export {}

declare global {
  namespace Express {
    export interface Request {
      session?: UserSession;
    }
  }
}