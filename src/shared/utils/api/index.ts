import { Response } from "express";

import { IServiceHelper } from "@shared/@types/api-response.type";

export const convertResponse = (response: Response, data: IServiceHelper) => {
  switch (data.status) {
    case "successful":
      return successfulResponse({
        response,
        message: data.message,
        meta: data.meta,
        data: data.data,
      });
    case "bad-request":
      return badRequestResponse({
        response,
        message: data.message,
        data: data.data,
      });
    default:
      return badRequestResponse({
        response,
        message: data.message,
        data: data.data,
      });
  }
};

export const successfulResponse = <T extends object>({
  response,
  data,
  message,
  meta,
}: {
  response: Response;
  data?: T;
  message: string;
  meta?: any;
}) => {
  return response.status(200).json({
    status: true,
    message,
    meta,
    data,
  });
};

export const badRequestResponse = <T extends object>({
  response,
  data,
  message,
}: {
  response: Response;
  data?: T;
  message: string;
}) => {
  return response.status(400).json({
    status: false,
    message,
    data,
  });
};
