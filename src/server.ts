import app from "./app";

async function bootstrap() {
  const PORT = 1124;
  const server = app.listen(PORT);

  // Handle Graceful Shutdown
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

  console.log("server started 🚀");
}

bootstrap();
