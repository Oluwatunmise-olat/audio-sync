import { singleton } from "tsyringe";
const { S3 } = require("aws-sdk");

import { awsConf } from "./constants";

@singleton()
export class AWSs3 {
  private readonly s3 = new S3({
    apiVersion: "4",
    region: "us-east-1",
  });

  public async upload(mediaStream, videoId: string) {
    try {
      const params = {
        Bucket: awsConf.bucket_name,
        Key: `${videoId}.mp3`,
        Body: mediaStream,
      };

      const upload = this.s3.upload(params);

      return await upload.promise();
    } catch (error) {
      console.error("[AWSs3]: upload Error uploading to S3:", error.message);
    }
  }
}
