import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout, getProfile, updateProfile, changePassword, uploadAvatarHandler, promoteToAdmin, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/schemas";

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: "error", statusCode: 429, message: "Demasiados intentos. Intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: "error", statusCode: 429, message: "Demasiados intentos. Intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: "error", statusCode: 429, message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: "error", statusCode: 429, message: "Demasiados intentos. Intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: "error", statusCode: 429, message: "Demasiados intentos. Intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), resetPasswordHandler);
router.post("/logout", logout);
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/me/password", authenticate, validate(changePasswordSchema), changePassword);
router.post("/me/avatar", authenticate, uploadAvatar.single("avatar"), uploadAvatarHandler);
router.post("/promote/:id", authenticate, requireAdmin, promoteToAdmin);

export default router;
