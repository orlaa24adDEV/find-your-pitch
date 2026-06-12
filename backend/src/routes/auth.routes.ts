import { Router } from "express";
import { register, login, refresh, logout, getProfile, updateProfile, changePassword, uploadAvatarHandler, promoteToAdmin } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validations/schemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/me/password", authenticate, validate(changePasswordSchema), changePassword);
router.post("/me/avatar", authenticate, uploadAvatar.single("avatar"), uploadAvatarHandler);
router.post("/promote/:id", authenticate, requireAdmin, promoteToAdmin);

export default router;
