import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemInput,
} from "@aws-sdk/client-dynamodb";
import { singleton } from "tsyringe";

import { SaveMetaDataToDynamodbType } from "@shared/@types/aws.type";
import conf from "@config/conf";
import { logger } from "../logger";

@singleton()
export class AWSDynamoDB {
  private table = "media_metadata";

  private readonly dynamodb = new DynamoDBClient({
    credentials: {
      accessKeyId: conf.aws.access_key_id,
      secretAccessKey: conf.aws.secret_access_key,
    },
  });

  async save(payload: SaveMetaDataToDynamodbType) {
    try {
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
      logger.error("[AWSDynamoDB]: save Error saving to DynamoDB: %o", {
        error_message: error.message,
      });
      return false;
    }
  }

  async getRecord(video_id: string): Promise<Record<string, any> | null> {
    try {
      const params: GetItemCommandInput = {
        Key: { video_id: { S: video_id } },
        TableName: this.table,
      };
      const record = await this.dynamodb.send(new GetItemCommand(params));

      return record.Item ? this.formatRecordToJson(record.Item) : null;
    } catch (error) {
      logger.error(
        "[AWSDynamoDB]: getRecord Error fetching record from DynamoDB: %o",
        { error_message: error.message },
      );
      return null;
    }
  }

  /**
   * payload comes in form { video_id: { S: '...' }, uploader: { S: '...' } }. This function maps
   * it to json { video_id: '...', uploader:'...'}
   * @param payload
   * @returns
   */
  private formatRecordToJson(payload: Record<string, AttributeValue>) {
    const formattedPayload = {};

    for (const [key, value] of Object.entries(payload)) {
      const attrDataType = Object.keys(value)[0];
      const attrValue = Object.values(value)[0];

      formattedPayload[key] =
        attrDataType === "N" ? parseInt(attrValue) : attrValue;
    }

    return formattedPayload;
  }
}
