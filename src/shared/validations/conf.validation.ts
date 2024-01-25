import { Joi } from "celebrate";

export const configRule = Joi.object({
  /** Aws Configs */
  SES_PASSWORD: Joi.string().required(),
  SES_USERNAME: Joi.string().required(),
  SES_SENDER_MAIL: Joi.string().required(),
  SECRET_ACCESS_KEY: Joi.string().required(),
  ACCESS_KEY_ID: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  SQS_URL: Joi.string().required(),

  /** Application Config */
  PORT: Joi.number().default(2020),
});
