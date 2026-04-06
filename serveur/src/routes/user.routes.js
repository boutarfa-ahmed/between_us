import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, nicknameSchema } from "../middleware/validation.js";
import { getProfile, getPartner, updateNickname } from "../controllers/user.controller.js";

const router = Router();

router.use(authenticate);

router.get("/me", getProfile);
router.get("/partner", getPartner);
router.put("/nickname", validate(nicknameSchema), updateNickname);

export default router;
