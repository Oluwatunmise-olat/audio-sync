import type { Request, Response, NextFunction } from "express";
import { CelebrateError, Segments, isCelebrateError } from "celebrate";

import { badRequestResponse, successfulResponse } from "@shared/utils/api";

export const baseRoute = (_request: Request, response: Response) => {
  return successfulResponse({
    response,
    message: "👀 Could not find the route you are accessing.",
  });
};

export const errorHandler = (
  error: any,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (isCelebrateError(error)) {
    return badRequestResponse({
      response,
      message: "Validation Error",
      data: formatCelebrateValidationError(error),
    });
  }

  return response
    .status(500)
    .json({ status: false, message: "Internal Server Error" });
};

const formatCelebrateValidationError = (error: CelebrateError) => {
  return error.details.get(Segments.BODY)?.details.map((validationErr) => {
    return {
      field: validationErr.context?.key,
      message: validationErr.message,
    };
  });
};
