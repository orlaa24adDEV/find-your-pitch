import { Router } from "express";
import { getAll, getById, create, update, remove, search, uploadImage } from "../controllers/fields.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadFieldImage } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getAll);
router.get("/search", search);
router.get("/:id", getById);
router.post("/", authenticate, requireAdmin, create);
router.put("/:id", authenticate, requireAdmin, update);
router.delete("/:id", authenticate, requireAdmin, remove);
router.post("/:id/image", authenticate, requireAdmin, uploadFieldImage.single("image"), uploadImage);

export default router;
