import app from "./app";

async function bootstrap() {
  const PORT = 1124; // Cleanup after deployment to use env;
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

  console.log("[app]: server started ✅");
}

bootstrap();
