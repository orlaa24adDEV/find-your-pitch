import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", FRONTEND_URL],
      fontSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/images", express.static("public/images"));

app.use("/api", router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
