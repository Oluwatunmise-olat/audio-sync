import { SQSEvent } from "@shared/enum/aws.enum";

export type PushToSqsType = {
  email: string;
  video_id: string;
  event_type: SQSEvent;
};

export type SaveMetaDataToDynamodbType = {
  title: string;
  duration: string;
  uploader: string;
  upload_date: string;
  video_id: string;
};

export type SqsEventType = {
  Records: Array<{
    messageId: string;
    receiptHandle: string;
    body: string;
    attributes: [Object];
    messageAttributes: {};
    md5OfBody: string;
    eventSource: string;
    eventSourceARN: string;
    awsRegion: string;
  }>;
};
