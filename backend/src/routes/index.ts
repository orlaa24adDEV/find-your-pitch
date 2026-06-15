import { Router } from "express";
import authRoutes from "./auth.routes";
import fieldsRoutes from "./fields.routes";
import bookingsRoutes from "./bookings.routes";
import favoritesRoutes from "./favorites.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/fields", fieldsRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/favorites", favoritesRoutes);

export default router;
