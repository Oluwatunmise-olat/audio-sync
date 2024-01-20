// TODO:: lambda event sourcing from sqs

import "reflect-metadata";
import { PassThrough } from "stream";
import { container } from "tsyringe";

import { PushToSqsType } from "@shared/@types/aws.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { AWSs3 } from "@shared/utils/aws/s3.util";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";

const youtubeDl = container.resolve(YoutubeDL);
const s3 = container.resolve(AWSs3);

export const handler = async (event, context) => {
  const parsedEvent: PushToSqsType =
    typeof event === "object" ? event : JSON.parse(event);

  if (
    parsedEvent.event_type === SQSEvent.PROCESS_MEDIA_DOWNLOAD &&
    parsedEvent.video_id
  ) {
    // TODO:: Schedule retries if the return value is null or undefined
    await processMediaDownload(parsedEvent.video_id);
    return;
  }

  return {
    health: "Okay",
    context,
    event,
  };
};

// const processMediaStreamToSpotify = async () => {
//   try {
//   } catch (error) {}
// };

/**
 * Get youtube media mp3 and stream directly to s3 bucket instead of downloading locally
 * @param videoId
 */
const processMediaDownload = async (videoId: string) => {
  try {
    const audioStream = youtubeDl.getAudioStream(videoId);

    const ps = new PassThrough();
    audioStream?.pipe(ps);

    const resp = await s3.upload(ps, videoId);
    console.log(`Media ${videoId} uploaded to S3 successfully`, resp);

    return "success";
  } catch (error) {
    console.error("Error processing media stream to S3:", error.message);
    return null;
  }
};
