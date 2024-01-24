import type { Router } from "express";
import { container } from "tsyringe";

import { EntryPointController } from "./entrypoint.controller";
import { validate } from "@shared/interceptors/validator.interceptor";
import { Segments } from "celebrate";
import { entrypointRule } from "@shared/validations/entrypoint.validation";

const _baseController = container.resolve(EntryPointController);

export const entryPointRoutes = (routerInstance: Router) => {
  const _routePrefix = "entrypoint";

  routerInstance.post(
    `/${_routePrefix}/upload`,
    validate<typeof entrypointRule>(Segments.BODY, entrypointRule),
    _baseController.validateVideoIdAndProcessRequest,
  );

  routerInstance.get(`/${_routePrefix}/test`, _baseController.testRoute);

  return routerInstance;
};
