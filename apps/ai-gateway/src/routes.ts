import { Router } from "express";
import { chatCompletion } from "./handlers/chat.js";
import { imageGeneration } from "./handlers/image.js";
import { listModels } from "./handlers/models.js";

export const router = Router();

router.post("/chat/completions", chatCompletion);
router.post("/images/generations", imageGeneration);
router.get("/models", listModels);
