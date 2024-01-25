import pathToFfmpeg from "ffmpeg-static";
import "reflect-metadata";
import { PassThrough } from "stream";
import { container } from "tsyringe";
const { spawn } = require("child_process");

import { PushToSqsType, SqsEventType } from "@shared/@types/aws.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSs3 } from "@shared/utils/aws/s3.util";
import { AWSSqs } from "@shared/utils/aws/sqs.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";
import { logger } from "@shared/utils/logger";
import { AWSses } from "@shared/utils/aws/ses.util";

const youtubeDl = container.resolve(YoutubeDL);
const s3 = container.resolve(AWSs3);
const sqs = container.resolve(AWSSqs);
const ses = container.resolve(AWSses);

export const handler = async (event: SqsEventType, _context) => {
  let defaultResponse: object = {
    status: "success",
    message: "Event processed successfully",
  };

  logger.info("[lambda]: handler: New Lambda Event ===> %o", { event });

  const sqsEvent = event.Records[0];
  if (!sqsEvent) return defaultResponse;

  const parsedEvent: PushToSqsType =
    typeof sqsEvent.body === "object" ? event : JSON.parse(sqsEvent.body);

  switch (parsedEvent.event_type) {
    case SQSEvent.PROCESS_MEDIA_DOWNLOAD:
      parsedEvent.video_id
        ? await performNewMediaUploadActions(parsedEvent)
        : null;
      break;
    case SQSEvent.PROCESS_MEDIA_STREAM:
      parsedEvent.email
        ? await performMediaStreamToUserActions(parsedEvent)
        : null;
      break;
  }

  return defaultResponse;
};

const performNewMediaUploadActions = async (payload: PushToSqsType) => {
  const mediaDownloadResponse = await processMediaDownload(payload.video_id);

  if (!mediaDownloadResponse) {
    /** Re-EnQueue */
    await sqs.push(payload);
    logger.info(
      `[lambda]: performNewMediaUploadActions. Re-Queuing Media with Payload ===> %o`,
      payload,
    );
    return;
  }

  await sqs.push({
    ...payload,
    event_type: SQSEvent.PROCESS_MEDIA_STREAM,
  });
};

const performMediaStreamToUserActions = async (payload: PushToSqsType) => {
  try {
    const presignedUrl = await s3.getPresignedUrl(`${payload.video_id}.mp3`);
    if (!presignedUrl) return;

    const message = `
      Download Link for "${payload.media_title}":
      ${presignedUrl}
      
      This link will expire in 10 minutes.
    `;

    await ses.send({
      recipient: payload.email,
      subject: "✨ New Media Download ✨",
      template: message,
    });
  } catch (error) {
    logger.error(`[lambda]: performMediaStreamToUserActions Error ===> %o`, {
      payload,
      error_message: error.message,
      error,
    });
  }
};

/**
 * Get youtube media mp3 and stream directly to s3 bucket instead of downloading locally
 * @param videoId
 */
const processMediaDownload = async (videoId: string) => {
  try {
    logger.info(
      `[lambda]: processMediaDownload ===> Attempting media download for video %o`,
      videoId,
    );

    const audioStream = await youtubeDl.getAudioStream(videoId);
    const passThroughStream = new PassThrough();

    const fmp = spawn(pathToFfmpeg, [
      "-i",
      "pipe:0",
      "-b:a",
      "192k",
      "-f",
      "mp3",
      "pipe:1",
    ]);

    audioStream?.pipe(fmp.stdin);

    const data: Buffer[] = [];
    fmp.stdout.on("data", (_data) => {
      data.push(_data);
    });

    fmp.stdout.on("end", () => {
      logger.info("[lambda]: processMediaDownload ====> FFmpeg process ended");
      s3.upload(Buffer.concat(data), videoId);
    });

    const streamEnded = new Promise<boolean>((resolve) => {
      passThroughStream.on("end", () => {
        resolve(true);
      });
    });

    await streamEnded;

    return true;
  } catch (error) {
    logger.error(
      "[lambda]: processMediaDownload Error ===> processing media stream to S3: %o",
      {
        error_message: error.message,
        error,
      },
    );

    return null;
  }
};
