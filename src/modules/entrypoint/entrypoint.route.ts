import type { Router } from "express";
import { container } from "tsyringe";

import { EntryPointController } from "./entrypoint.controller";

const _baseController = container.resolve(EntryPointController);

// TODO:: Add validation
export const entryPointRoutes = (routerInstance: Router) => {
  const _routePrefix = "entrypoint";

  routerInstance.post(
    `/${_routePrefix}/upload`,
    _baseController.validateVideoIdAndProcessRequest
  );

  return routerInstance;
};
