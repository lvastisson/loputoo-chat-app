import express, { Request, Response } from "express";

export const statusRouter = express.Router();

statusRouter.use(express.json());

statusRouter.get("/", async (_req: Request, res: Response) => {
  res.status(200).send('Server is running');
});
