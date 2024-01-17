export { eventHandler } from "@modules/lambda/lambda.service";

// aws lambda create-function --function-name my-local-lambda --runtime nodejs16.x --role arn:aws:iam::123456789012:role/execution_role --handler dist/index.eventHandler --zip-file fileb:///Users/oluwatunmise/Desktop/Projects/playground/java/audio-sync/audiosync.zip --endpoint-url http://localhost:4566
