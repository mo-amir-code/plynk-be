import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { requestLogger } from "./common/middleware/logger.middleware";
import { readinessGuard } from "./common/middleware/readiness.middleware";
import { globalErrorHandler } from "./common/middleware/error.middleware";
import { HttpStatus } from "./common/enums/http-status.enum";
import { sendResponse } from "./common/utils/app-response";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import pageRoutes from "./modules/page/page.routes";
import widgetRoutes from "./modules/widget/widget.routes";
import themeRoutes from "./modules/theme/theme.routes";
import widgetTypeRoutes from "./modules/widget-type/widget-type.routes";

import assetRoutes from "./modules/asset/asset.routes";
import helmet from "helmet";
import { healthState } from "./common/utils/health";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./common/config/swagger";

dotenv.config();

const app: Application = express();

app.use(helmet());

const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(requestLogger);
app.use(readinessGuard);

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


app.get("/health", (req: Request, res: Response) => {
  if (!healthState.isReady) {
    return sendResponse(res, HttpStatus.SERVICE_UNAVAILABLE, "✅ Server is starting...", {
      ready: false,
    });
  }

  return sendResponse(res, HttpStatus.OK, "Server is healthy :)", {
    ready: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/page", pageRoutes);
app.use("/api/v1/widgets", widgetRoutes);
app.use("/api/v1/themes", themeRoutes);
app.use("/api/v1/widget-types", widgetTypeRoutes);
app.use("/api/v1/assets", assetRoutes);

app.use((req: Request, res: Response) => {
  sendResponse(res, HttpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`);
});

app.use(globalErrorHandler);

export default app;
