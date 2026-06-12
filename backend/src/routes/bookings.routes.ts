import { Router } from "express";
import {
  getAll,
  create,
  getMyBookings,
  getUnpaid,
  getById,
  getByField,
  cancel,
  pay,
} from "../controllers/bookings.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBookingSchema } from "../validations/schemas";

const router = Router();

router.use(authenticate);

router.get("/all", requireAdmin, getAll);
router.post("/", validate(createBookingSchema), create);
router.get("/my", getMyBookings);
router.get("/unpaid", getUnpaid);
router.get("/field/:fieldId", getByField);
router.get("/:id", getById);
router.delete("/:id", cancel);
router.post("/:id/pay", pay);

export default router;
