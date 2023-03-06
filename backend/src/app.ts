import express, { Application } from "express";
import { connectToDatabase } from "./services/database.service";
import { messagesRouter } from "./routes/messages.router";

const app: Application = express();
const port = 5000;

connectToDatabase()
  .then(() => {
    app.use("/messages", messagesRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
