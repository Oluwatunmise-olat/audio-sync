import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { singleton } from "tsyringe";
const { S3 } = require("aws-sdk");

import conf from "@config/conf";
import { logger } from "../logger";
import { awsConf } from "./constants";

@singleton()
export class AWSs3 {
  private readonly _config = {
    apiVersion: "4",
    region: conf.aws.region,
    credentials: {
      accessKeyId: conf.aws.access_key_id,
      secretAccessKey: conf.aws.secret_access_key,
    },
  };

  private readonly s3 = new S3(this._config);

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
      logger.error("[AWSs3]: upload Error uploading to S3: %o", {
        error_message: error.message,
      });
      return null;
    }
  }

  public async getPresignedUrl(media_key: string, expiry_in_seconds = 60 * 10) {
    try {
      const command = new GetObjectCommand({
        Bucket: awsConf.bucket_name,
        Key: media_key,
        ResponseContentType: "application/octet-stream",
        ResponseContentDisposition: "attachment",
      });

      // @ts-ignore
      return await getSignedUrl(new S3Client(this._config), command, {
        expiresIn: expiry_in_seconds,
      });
    } catch (error) {
      logger.error("[AWSs3]: getPresignedUrl Error getting presigned url: %o", {
        error_message: error.message,
      });
      return null;
    }
  }
}
