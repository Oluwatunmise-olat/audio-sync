import { configRule } from "@shared/validations/conf.validation";

const { value, error } = configRule.validate(process.env, {
  stripUnknown: true,
});

if (error) throw error;

export default {
  aws: {
    secret_access_key: value.SECRET_ACCESS_KEY,
    access_key_id: value.ACCESS_KEY_ID,
    region: value.AWS_REGION,
    ses: {
      user_name: value.SES_USERNAME,
      password: value.SES_PASSWORD,
      sender_mail: value.SES_SENDER_MAIL,
    },
    sqs: {
      url: value.SQS_URL,
    },
  },
  app: {
    port: value.PORT,
  },
};
