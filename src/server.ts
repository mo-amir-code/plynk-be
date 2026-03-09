import "dotenv/config";
import app from "./app";
import logger from "./common/logger";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    const server = app.listen(PORT, () => {
      logger.info(`⚙️ Server is running on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info("Shutting down server...");
      server.close(async () => {
        await prisma.$disconnect();
        logger.info("Database disconnected. Process exited.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error: any) {
    logger.error(error, "Failed to start server:");
    process.exit(1);
  }
}

startServer();
