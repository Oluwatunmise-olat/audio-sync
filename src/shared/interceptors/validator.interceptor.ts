import { Joi, Segments, celebrate } from "celebrate";

export const validate = <T>(
  validation_path: Segments,
  schema: Joi.ObjectSchema<T>,
) => {
  return celebrate(
    { [validation_path]: schema },
    { abortEarly: false, allowUnknown: false, errors: { label: "key" } },
  );
};
