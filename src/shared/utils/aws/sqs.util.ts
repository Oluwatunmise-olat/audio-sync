import {
  DeleteMessageCommand,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";
import { singleton } from "tsyringe";
import { randomUUID } from "crypto";

import { PushToSqsType } from "@shared/@types/aws.type";
import conf from "@config/conf";
import { logger } from "../logger";

@singleton()
export class AWSSqs {
  private readonly sqs = new SQSClient({
    credentials: {
      accessKeyId: conf.aws.access_key_id,
      secretAccessKey: conf.aws.secret_access_key,
    },
    region: conf.aws.region,
  });

  private readonly queueURL = conf.aws.sqs.url;

  async push(payload: PushToSqsType) {
    try {
      const params: SendMessageCommandInput = {
        QueueUrl: this.queueURL,
        MessageBody: JSON.stringify(payload),
        MessageGroupId: randomUUID(),
      };

      await this.sqs.send(new SendMessageCommand(params));
      return true;
    } catch (error) {
      logger.error("[AWSSqs]: push Error pushing to SQS: %o", {
        error_message: error.message,
        error,
      });
      return null;
    }
  }

  async delete(messageReceipt: string) {
    try {
      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueURL,
          ReceiptHandle: messageReceipt,
        }),
      );

      return true;
    } catch (error) {
      logger.error("[AWSSqs]: delete Error deleting message from SQS: %o", {
        error_message: error.message,
      });

      return null;
    }
  }
}
