import { injectable } from "tsyringe";

import { IServiceHelper } from "@shared/@types/api-response.type";
import { VideoMetaDataType } from "@shared/@types/youtube-dl.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSDynamoDB } from "@shared/utils/aws/dynamodb.util";
import { AWSSqs } from "@shared/utils/aws/sqs.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";
import { ValidateVideoIdAndProcessRequestType } from "@shared/@types/entrypoint.type";

// TODO: Factor in spotify validation
@injectable()
export class EntryPointService {
  constructor(
    private readonly youtubeDl: YoutubeDL,
    private readonly dynamodb: AWSDynamoDB,
    private readonly sqs: AWSSqs
  ) {}

  async validateVideoIdAndProcessRequest({
    video_id,
  }: ValidateVideoIdAndProcessRequestType): Promise<IServiceHelper> {
    try {
      const _successMessage =
        "Your request has been received and would be processed shortly.";

      const mediaRecord = await this.dynamodb.getRecord(video_id);

      if (mediaRecord) {
        await this.processExistingMediaUpload(video_id);
        return { status: "successful", message: _successMessage };
      }

      const metaData = await this.youtubeDl.getMetadata(video_id);
      if (!metaData)
        return { status: "bad-request", message: "Invalid video_id" };

      const { status, message } = await this.processNewMediaUpload(
        metaData,
        video_id
      );
      if (!status) return { status: "bad-request", message };

      return { status: "successful", message: _successMessage };
    } catch (error) {
      return {
        status: "bad-request",
        message:
          "Could not process your request at the moment. Please try again later",
      };
    }
  }

  private async processNewMediaUpload(
    payload: VideoMetaDataType,
    video_id: string
  ) {
    const uploaded = await this.dynamodb.save({
      duration: payload.duration,
      title: payload.title,
      upload_date: payload.upload_date,
      uploader: payload.uploader,
      video_id,
    });

    if (!uploaded) {
      return {
        status: false,
        message:
          "Could not process your request at the moment. Please try again later",
      };
    }

    await this.sqs.push({
      video_id,
      event_type: SQSEvent.PROCESS_MEDIA_DOWNLOAD,
    });

    return { status: true, message: "processed" };
  }

  private async processExistingMediaUpload(video_id: string) {
    await this.sqs.push({
      video_id,
      event_type: SQSEvent.PROCESS_MEDIA_STREAM,
    });
  }
}
