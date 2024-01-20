import { SQSEvent } from "@shared/enum/aws.enum";

export type PushToSqsType = {
  email?: string;
  video_id: string;
  event_type: SQSEvent;
  s3_url?: string;
};

export type SaveMetaDataToDynamodbType = {
  title: string;
  duration: string;
  uploader: string;
  upload_date: string;
  video_id: string;
};
