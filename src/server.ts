import "dotenv/config";
import conf from "@config/conf";
import app from "./app";
import { logger } from "@shared/utils/logger";

async function bootstrap() {
  const PORT = conf.app.port;
  const server = app.listen(PORT);

  process
    .on("uncaughtException", (error) => {
      logger.error("Uncaught exception ===> %o", { err: error });
      server.close();
      process.exit(1);
    })
    .on("SIGINT", () => {
      server.close();
      process.exit(1);
    });

  logger.info(`[app]: server started ✅ on port %o 🚀`, PORT);
}

bootstrap();
