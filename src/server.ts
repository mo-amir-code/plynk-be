import "dotenv/config";
import app from "./app";
import logger from "./common/logger";
import prisma from "./config/prisma";

import { healthState } from "./common/utils/health";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    const server = app.listen(Number(PORT), "0.0.0.0", async () => {
      logger.info(`⚙️ Server is running on port ${PORT}`);
      try {
        await prisma.$connect();
        healthState.isReady = true;
        logger.info("✅ Database connected successfully");
      } catch (err: any) {
        logger.error(err, "❌ Database connection failed");
      }
    });

    const shutdown = async () => {
      logger.info("😴 Shutting down server...");
      healthState.isReady = false;
      server.close(async () => {
        await prisma.$disconnect();
        logger.info("🤪 Database disconnected. Process exited.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error: any) {
    logger.error(error, "Failed to initialize server process:");
    process.exit(1);
  }
}

startServer();
