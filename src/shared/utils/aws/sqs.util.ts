import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";
import { singleton } from "tsyringe";

import { PushToSqsType } from "@shared/@types/aws.type";
import { awsConf } from "./constants";

@singleton()
export class AWSSqs {
  private readonly sqs = new SQSClient({
    endpoint: awsConf.endpoint,
  });
  private readonly queueURL = awsConf.sqs_url;

  async push(payload: PushToSqsType) {
    try {
      const params: SendMessageCommandInput = {
        QueueUrl: this.queueURL,
        MessageBody: JSON.stringify(payload),
      };

      await this.sqs.send(new SendMessageCommand(params));
      return true;
    } catch (error) {
      console.error("[AWSSqs]: push Error pushing to SQS:", error.message);
      return null;
    }
  }
}
