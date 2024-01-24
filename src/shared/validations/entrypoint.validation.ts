import { Joi } from "celebrate";

export const entrypointRule = Joi.object({
  video_id: Joi.string().required(),
  email: Joi.string().required(),
});
