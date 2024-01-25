import pathToFfmpeg from "ffmpeg-static";
import "reflect-metadata";
import { PassThrough } from "stream";
import { container } from "tsyringe";
const { spawn } = require("child_process");

import { PushToSqsType } from "@shared/@types/aws.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSs3 } from "@shared/utils/aws/s3.util";
import { AWSSqs } from "@shared/utils/aws/sqs.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";

const youtubeDl = container.resolve(YoutubeDL);
const s3 = container.resolve(AWSs3);
const sqs = container.resolve(AWSSqs);

export const handler = async (event, _context) => {
  const parsedEvent: PushToSqsType =
    typeof event === "object" ? event : JSON.parse(event);

  const defaultResponse = {
    status: "success",
    message: "Event processed successfully",
    data: {
      _meta: {
        event_type: parsedEvent.event_type,
        media_id: parsedEvent.video_id,
        record: event?.Records ?? "",
      },
    },
  };

  if (
    parsedEvent.event_type === SQSEvent.PROCESS_MEDIA_DOWNLOAD &&
    parsedEvent.video_id
  ) {
    await performNewMediaUploadActions(parsedEvent.video_id, parsedEvent.email);
    return defaultResponse;
  }

  console.log(defaultResponse);
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
    console.log(
      `[lambda]: processMediaDownload ====> Attempting media download for video ${videoId}`,
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
      console.log("[lambda]: processMediaDownload ====> FFmpeg process ended");
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
    console.error(
      "[lambda]: processMediaDownload Error ===> processing media stream to S3:",
      error.message,
      error,
    );

    return null;
  }
};
