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

const youtubeDl = container.resolve(YoutubeDL);
const s3 = container.resolve(AWSs3);
const sqs = container.resolve(AWSSqs);

export const handler = async (event: SqsEventType, _context) => {
  let defaultResponse: object = {
    status: "success",
    message: "Event processed successfully",
  };

  const sqsEvent = event.Records[0];

  if (!sqsEvent) return defaultResponse;

  const parsedEvent: PushToSqsType =
    typeof sqsEvent.body === "object" ? event : JSON.parse(sqsEvent.body);

  if (
    parsedEvent.event_type === SQSEvent.PROCESS_MEDIA_DOWNLOAD &&
    parsedEvent.video_id
  ) {
    await performNewMediaUploadActions(parsedEvent.video_id, parsedEvent.email);
    return defaultResponse;
  }

  return defaultResponse;
};

const performNewMediaUploadActions = async (
  video_id: string,
  email: string,
) => {
  const mediaDownloadResponse = await processMediaDownload(video_id);

  if (!mediaDownloadResponse) {
    /** Re-EnQueue */
  }

  await sqs.push({
    video_id,
    event_type: SQSEvent.PROCESS_MEDIA_STREAM,
    email,
  });
};

export const performMediaStreamToUserActions = async () => {
  try {
  } catch (error) {}
};

export const sendPresignedMediaUrl = async (videoId: string, email: string) => {
  try {
  } catch (error) {
    return null;
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

    return;
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
