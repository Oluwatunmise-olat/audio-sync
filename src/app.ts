import "reflect-metadata";

import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";

import routeHandler from "@shared/routers";
import { baseRoute, errorHandler } from "@shared/routers/defaults";

const app = express();

function loadMiddlewares(app: Application) {
  app.use([express.json()]);
  app.use(cors());
  app.use(helmet());
  app.use(routeHandler());
  app.use(baseRoute);
  app.use(errorHandler);
}

loadMiddlewares(app);

export default app;
