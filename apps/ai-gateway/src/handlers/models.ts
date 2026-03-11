import type { Request, Response } from "express";
import { listAllModels } from "../providers/index.js";

export function listModels(_req: Request, res: Response) {
  res.json({ models: listAllModels() });
}
