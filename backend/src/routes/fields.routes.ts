import { Router } from "express";
import { getAll, getById, create, update, remove, search, uploadImage } from "../controllers/fields.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadFieldImage } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createFieldSchema, updateFieldSchema } from "../validations/schemas";

const router = Router();

router.get("/", optionalAuth, getAll);
router.get("/search", optionalAuth, search);
router.get("/:id", optionalAuth, getById);
router.post("/", authenticate, requireAdmin, validate(createFieldSchema), create);
router.put("/:id", authenticate, requireAdmin, validate(updateFieldSchema), update);
router.delete("/:id", authenticate, requireAdmin, remove);
router.post("/:id/image", authenticate, requireAdmin, uploadFieldImage.single("image"), uploadImage);

export default router;
