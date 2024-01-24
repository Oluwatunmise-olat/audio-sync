import "dotenv/config";
import conf from "@config/conf";
import app from "./app";

async function bootstrap() {
  const PORT = conf.app.port;
  const server = app.listen(PORT);

  process
    .on("uncaughtException", (error) => {
      console.error("Uncaught exception", { err: error });
      server.close();
      process.exit(1);
    })
    .on("SIGINT", () => {
      server.close();
      process.exit(1);
    });

  console.log(`[app]: server started ✅ on port ${PORT} 🚀`);
}

bootstrap();
