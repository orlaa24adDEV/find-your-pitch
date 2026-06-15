import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as favoritesController from "../controllers/favorites.controller";

const router = Router();

router.post("/:fieldId", authenticate, favoritesController.toggle);
router.get("/", authenticate, favoritesController.list);

export default router;
