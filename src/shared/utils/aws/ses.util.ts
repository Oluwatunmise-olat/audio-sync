import { SES } from "aws-sdk";
import { injectable } from "tsyringe";
import { createTransport } from "nodemailer";

import conf from "@config/conf";
import { SendMailType } from "@shared/@types/aws.type";

@injectable()
export class AWSses {
  private readonly ses = new SES({
    apiVersion: "4",
    region: conf.aws.region,
    credentials: {
      accessKeyId: conf.aws.access_key_id,
      secretAccessKey: conf.aws.secret_access_key,
    },
  });

  private readonly transporter = createTransport({ SES: this.ses });

  async send(payload: SendMailType) {
    const mail = {
      from: `Audio Sync <${conf.aws.ses.sender_mail}>`,
      to: payload.recipient,
      subject: payload.subject,
      html: payload.template,
    };

    await this.transporter.sendMail(mail);
  }
}
