// TODO:: lambda event sourcing from sqs

// lambda and s3
import "reflect-metadata";
import { container } from "tsyringe";

import { PushToSqsType } from "@shared/@types/aws.type";
import { SQSEvent } from "@shared/enum/aws.enum";
import { YoutubeDL } from "@shared/utils/youtube-dl/youtube-dl.util";

const youtubeDl = container.resolve(YoutubeDL);

export const eventHandler = async (event, context) => {
  const parsedEvent: PushToSqsType =
    typeof event === "object" ? event : JSON.parse(event);

  if (parsedEvent.event_type === SQSEvent.PROCESS_MEDIA_DOWNLOAD) {
    await processMediaDownload();
    return;
  }

  const _metadata = await youtubeDl.getMetadata("vFhyn7fZ-Eg");

  console.log("Lambda Event Triggered 🫵🏾");

  return {
    health: "Okay",
    event: parsedEvent,
    context,
    _metadata,
  };
};

const processMediaDownload = async () => {
  try {
  } catch (error) {}
};

// const processMediaStream = async () => {
//   try {
//   } catch (error) {}
// };
