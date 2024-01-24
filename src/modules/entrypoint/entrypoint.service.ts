import { injectable } from "tsyringe";

import { IServiceHelper } from "@shared/@types/api-response.type";
import { ValidateVideoIdAndProcessRequestType } from "@shared/@types/entrypoint.type";
import { VideoMetaDataType } from "@shared/@types/youtube-dl.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSDynamoDB } from "@shared/utils/aws/dynamodb.util";
import { AWSSqs } from "@shared/utils/aws/sqs.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";

// TODO:
// Add Validation: Max video length of 30 mins due to limited compute resource
// Setup: Email for notification using ses
// Setup: sqs as event source for lambda
@injectable()
export class EntryPointService {
  constructor(
    private readonly youtubeDl: YoutubeDL,
    private readonly dynamodb: AWSDynamoDB,
    private readonly sqs: AWSSqs,
  ) {}

  async validateVideoIdAndProcessRequest({
    video_id,
    email,
  }: ValidateVideoIdAndProcessRequestType): Promise<IServiceHelper> {
    try {
      const _successMessage =
        "Your request has been received and would be processed shortly.";

      const mediaRecord = await this.dynamodb.getRecord(video_id);
      if (mediaRecord) {
        await this.pushToQueue(video_id, email, SQSEvent.PROCESS_MEDIA_STREAM);
        return { status: "successful", message: _successMessage };
      }

      const metaData = await this.youtubeDl.getMetadata(video_id);
      if (!metaData)
        return { status: "bad-request", message: "Invalid video_id" };

      const { status, message } = await this.processNewMediaUpload(
        metaData as any,
        video_id,
        email,
      );
      if (!status) return { status: "bad-request", message };

      return { status: "successful", message: _successMessage, data: metaData };
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
    video_id: string,
    recipient_email: string,
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

    await this.pushToQueue(
      video_id,
      recipient_email,
      SQSEvent.PROCESS_MEDIA_DOWNLOAD,
    );

    return { status: true, message: "processed" };
  }

  private async pushToQueue(
    video_id: string,
    recipient_email: string,
    event_type: SQSEvent,
  ) {
    await this.sqs.push({
      video_id,
      event_type,
      email: recipient_email,
    });
  }
}
