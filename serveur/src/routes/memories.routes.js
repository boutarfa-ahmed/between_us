import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadMiddleware } from "../lib/cloudinary.js";
import { validate, guessSchema, guessDecisionSchema } from "../middleware/validation.js";
import { uploadLimiter } from "../middleware/security.js";
import {
  createMemory,
  getMemories,
  getMemory,
  deleteMemory,
} from "../controllers/memories.controller.js";
import { submitGuess, getGuess, decideGuess } from "../controllers/guesses.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getMemories);
router.post("/", uploadLimiter, uploadMiddleware.single("image"), createMemory);
router.get("/:id", getMemory);
router.delete("/:id", deleteMemory);

router.post("/:id/guess", validate(guessSchema), submitGuess);
router.get("/:id/guess", getGuess);
router.post("/:id/guess/decide", validate(guessDecisionSchema), decideGuess);

export default router;