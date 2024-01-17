// TODO:: lambda event sourcing from sqs
// lambda and s3
export const eventHandler = async (event, context) => {
  console.log("Lambda Event Triggered 🫵🏾");

  return { health: "Okay" };
};
