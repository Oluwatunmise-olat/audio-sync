import { singleton } from "tsyringe";
const { S3 } = require("aws-sdk");

import { awsConf } from "./constants";
import conf from "@config/conf";

@singleton()
export class AWSs3 {
  private readonly s3 = new S3({
    apiVersion: "4",
    region: conf.aws.region,
    credentials: {
      accessKeyId: conf.aws.access_key_id,
      secretAccessKey: conf.aws.secret_access_key,
    },
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
