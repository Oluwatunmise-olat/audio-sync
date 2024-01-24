import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemInput,
} from "@aws-sdk/client-dynamodb";
import { singleton } from "tsyringe";

import { SaveMetaDataToDynamodbType } from "@shared/@types/aws.type";
import { awsConf } from "./constants";

@singleton()
export class AWSDynamoDB {
  private table = "media_metadata";

  private readonly dynamodb = new DynamoDBClient({
    endpoint: awsConf.endpoint,
  });

  async save(payload: SaveMetaDataToDynamodbType) {
    try {
      // TODO: Rethink schema
      const params: PutItemInput = {
        TableName: this.table,
        Item: {
          title: { S: payload.title },
          duration: { N: String(payload.duration) },
          uploader: { S: payload.uploader },
          upload_date: { S: payload.upload_date },
          video_id: { S: payload.video_id },
          is_processed: { BOOL: false },
        },
      };

      await this.dynamodb.send(new PutItemCommand(params));
      return true;
    } catch (error) {
      console.error(
        "[AWSDynamoDB]: save Error saving to DynamoDB:",
        error.message,
      );
      return false;
    }
  }

  async getRecord(video_id: string) {
    try {
      const params: GetItemCommandInput = {
        Key: { video_id: { S: video_id } },
        TableName: this.table,
      };
      const record = await this.dynamodb.send(new GetItemCommand(params));

      return record.Item ? record.Item.Item : null;
    } catch (error) {
      console.error(
        "[AWSDynamoDB]: getRecord Error fetching record from DynamoDB:",
        error.message,
      );
    }
  }
}
