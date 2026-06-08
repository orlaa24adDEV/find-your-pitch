import { Router } from "express";
import authRoutes from "./auth.routes";
import fieldsRoutes from "./fields.routes";
import bookingsRoutes from "./bookings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/fields", fieldsRoutes);
router.use("/bookings", bookingsRoutes);

export default router;
