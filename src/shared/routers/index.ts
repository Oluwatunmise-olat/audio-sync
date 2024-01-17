import { Router } from "express";

import { entryPointRoutes } from "@modules/entrypoint/entrypoint.route";

const router = Router();

const applicationRouters = () => {
  entryPointRoutes(router);

  return router;
};

export default applicationRouters;
