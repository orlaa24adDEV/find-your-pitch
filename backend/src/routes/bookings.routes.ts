import { Router } from "express";
import { create, getMyBookings, getByField, cancel } from "../controllers/bookings.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/my", getMyBookings);
router.get("/field/:fieldId", getByField);
router.delete("/:id", cancel);

export default router;
