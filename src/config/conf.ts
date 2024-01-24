import { configRule } from "@shared/validations/conf.validation";

const { value, error } = configRule.validate(process.env, {
  stripUnknown: true,
});

if (error) throw error;

export default {
  aws: {
    ses: {
      user_name: value.SES_USERNAME,
      password: value.SES_PASSWORD,
    },
  },
  app: {
    port: value.PORT,
  },
};
