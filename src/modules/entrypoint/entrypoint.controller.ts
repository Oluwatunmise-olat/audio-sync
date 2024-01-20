import { Request, Response } from "express";
import { injectable } from "tsyringe";

import { ValidateVideoIdAndProcessRequestType } from "@shared/@types/entrypoint.type";
import { convertResponse } from "@shared/utils/api";
import { EntryPointService } from "./entrypoint.service";

@injectable()
export class EntryPointController {
  constructor(private readonly entryPointService: EntryPointService) {}

  validateVideoIdAndProcessRequest = async (
    request: Request,
    response: Response,
  ) => {
    const data = await this.entryPointService.validateVideoIdAndProcessRequest(
      request.body as unknown as ValidateVideoIdAndProcessRequestType,
    );

    return convertResponse(response, data);
  };
}
