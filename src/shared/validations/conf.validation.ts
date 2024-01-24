import { Joi } from "celebrate";

export const configRule = Joi.object({
  // SES
  SES_PASSWORD: Joi.string().required(),
  SES_USERNAME: Joi.string().required(),

  // App
  PORT: Joi.number().default(2020),

  // SQS

  // DynamoDB
});
