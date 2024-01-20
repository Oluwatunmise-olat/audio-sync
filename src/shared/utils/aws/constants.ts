export const awsConf = {
  region: "eu-central-1", // Local test region
  endpoint: "http://localhost:4566", // Local testing endpoint
  bucket_name: "sample-bucket-name-audio-sync",
  sqs_url:
    "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/media_metadata_queue", // TODO:: <- Pass as env from lambda
};
