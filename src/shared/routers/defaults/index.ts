import type { Request, Response } from "express";

import { successfulResponse } from "@shared/utils/api";

export const baseRoute = (_request: Request, response: Response) => {
  return successfulResponse({
    response,
    message: "👀 Could not find the route you are accessing.",
  });
};
