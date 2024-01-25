import { injectable } from "tsyringe";

import { IServiceHelper } from "@shared/@types/api-response.type";
import { ValidateVideoIdAndProcessRequestType } from "@shared/@types/entrypoint.type";
import { VideoMetaDataType } from "@shared/@types/youtube-dl.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSDynamoDB } from "@shared/utils/aws/dynamodb.util";
import { AWSSqs } from "@shared/utils/aws/sqs.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";

// TODO: presigned link for download

@injectable()
export class EntryPointService {
  private readonly MAX_VIDEO_LENGTH_IN_SECONDS = 60 * 30; // 30 minutes

  constructor(
    private readonly youtubeDl: YoutubeDL,
    private readonly dynamodb: AWSDynamoDB,
    private readonly sqs: AWSSqs,
  ) {}

  public async validateVideoIdAndProcessRequest({
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
        return { status: "bad_request", message: "Invalid video_id" };

      if (
        Math.ceil(Number(metaData.duration)) > this.MAX_VIDEO_LENGTH_IN_SECONDS
      )
        return {
          status: "bad_request",
          message: "Media exceeds maximum allowed duration of 30 minutes",
        };

      const { status, message } = await this.processNewMediaUpload(
        metaData as any,
        video_id,
        email,
      );
      if (!status) return { status: "bad_request", message };

      return { status: "successful", message: _successMessage, data: metaData };
    } catch (error) {
      return {
        status: "bad_request",
        message:
          "Could not process your request at the moment. Please try again later",
      };
    }
  }

  public async testServices(): Promise<IServiceHelper> {
    const dynamodbData = await this.dynamodb.getRecord("test_123");

    console.log("dynamodb Response ===>", dynamodbData);

    await this.pushToQueue(
      "vFhyn7fZ-Eg",
      "mailto@no-reply.com",
      SQSEvent.PROCESS_MEDIA_DOWNLOAD,
    );

    return {
      status: "successful",
      message: "Successful Api Call",
      data: { dynamodb: dynamodbData, service: "olatb" },
    };
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
