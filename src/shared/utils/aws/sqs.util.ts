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

      const result = await this.sqs.send(new SendMessageCommand(params));
      console.log(result, "SQS message sent successfully");
    } catch (error) {
      console.error("Error pushing to SQS:", error.message);
    }
  }
}
