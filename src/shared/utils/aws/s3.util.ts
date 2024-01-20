import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { singleton } from "tsyringe";

import { awsConf } from "./constants";

@singleton()
export class AWSs3 {
  private readonly s3 = new S3Client({});

  public async upload(mediaStream, videoId: string) {
    try {
      const payload: PutObjectCommandInput = {
        Bucket: awsConf.bucket_name,
        Body: mediaStream,
        Key: `${videoId}.mp3`,
        ContentType: "audio/mp3",
      };

      const upload = new Upload({
        client: this.s3,
        params: payload,
      });

      await upload.done();
    } catch (error) {
      console.error("Error uploading to S3:", error.message);
    }
  }
}
