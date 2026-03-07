import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requestLogger } from "./common/middleware/logger.middleware";
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

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req: Request, res: Response) => {
  return sendResponse(res, HttpStatus.OK, "Server is healthy", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pages", pageRoutes);
app.use("/api/v1/widgets", widgetRoutes);
app.use("/api/v1/themes", themeRoutes);
app.use("/api/v1/widget-types", widgetTypeRoutes);
app.use("/api/v1/assets", assetRoutes);

app.use((req: Request, res: Response) => {
  sendResponse(res, HttpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`);
});

app.use(globalErrorHandler);

export default app;
