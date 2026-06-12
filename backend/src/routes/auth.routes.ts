import { Router } from "express";
import { register, login, refresh, logout, getProfile, updateProfile, changePassword, uploadAvatarHandler, promoteToAdmin } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);
router.put("/me/password", authenticate, changePassword);
router.post("/me/avatar", authenticate, uploadAvatar.single("avatar"), uploadAvatarHandler);
router.post("/promote/:id", authenticate, requireAdmin, promoteToAdmin);

export default router;
