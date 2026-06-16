import { Router } from "express";
import {
  list,
  getById,
  listUserBookings,
  remove,
  changeRole,
} from "../controllers/users.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", list);
router.get("/:id", getById);
router.get("/:id/bookings", listUserBookings);
router.delete("/:id", remove);
router.put("/:id/role", changeRole);

export default router;
