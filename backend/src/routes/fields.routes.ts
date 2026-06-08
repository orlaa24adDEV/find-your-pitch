import { Router } from "express";
import { getAll, getById, create, search } from "../controllers/fields.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAll);
router.get("/search", search);
router.get("/:id", getById);
router.post("/", authenticate, create);

export default router;
