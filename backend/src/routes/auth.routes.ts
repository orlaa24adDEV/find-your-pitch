import { Router } from "express";
import { register, login, refresh, logout, promoteToAdmin } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/promote/:id", authenticate, requireAdmin, promoteToAdmin);

export default router;
