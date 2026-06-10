import { Router } from "express";
import {
  create,
  getMyBookings,
  getUnpaid,
  getById,
  getByField,
  cancel,
  pay,
} from "../controllers/bookings.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/my", getMyBookings);
router.get("/unpaid", getUnpaid);
router.get("/field/:fieldId", getByField);
router.get("/:id", getById);
router.delete("/:id", cancel);
router.post("/:id/pay", pay);

export default router;
