<h1 align="center">
  <br>
  <a href="https://github.com/Oluwatunmise-olat"><img width="64" height="64" src="https://img.icons8.com/cotton/64/cloud-refresh.png" alt="audio-sync"/></a>
  <br>
  Audio Sync
  <br>
</h1>

<h4 align="center">Serverless solution that allows you to download audio from a YouTube video, and provides a secure link to download the audio file locally to any device via mail. Leverages AWS Lambda, S3, Dynamo DB and SQS to automate the process.</h4>

## 📇 API Documentation

All API documentation can be found [here](https://documenter.getpostman.com/view/16498899/2s9YypFNsB).

<!-- ## 👷🏽‍♂️ Installation And Usage -->

### 🚧 TODO

- Ses Production Access

### ☢️ Side Notes

- Max video length accepted is 30 minutes
- The public api routes (for media uploads) is hosted on render (free tier) which takes some time to boot back up after moments of inactivity, so you might experience slow api calls if the server has gone into an inactive state

### ⛓️ Infrastructure Provisioning

The Terraform scripts in this repository define the infrastructure components required for the application. Here is a brief overview of the components:

- DynamoDB Table:
  Manages a DynamoDB table with primary key (partition key) attribute "video_id."

- S3 Bucket (aws_s3_bucket):
  Creates an S3 bucket and disabled bucket versioning incases of file overrides not to create versioned objects. Media files are created here.

- SQS Queue:
  Creates an SQS FIFO queue.

- ECR Repository (aws_ecr_repository):
  Sets up an Amazon Elastic Container Registry (ECR) repository for storing our docker images."

- IAM Role for Lambda:
  Defines an IAM role with an assume role policy allowing AWS Lambda to assume the role.

- IAM Policy Attachments (aws_iam_role_policy_attachment):
  Attaches policies to the IAM role, granting necessary permissions for Amazon S3, CloudWatch Logs, SQS, and S3 Object Lambda execution.

- Lambda Function (aws_lambda_function):
  Creates a Lambda function with specified configurations, including architecture, image URI, memory size, and timeout.

- Lambda Event Source Mapping:
  Configures SQS queue as an event source for the Lambda function.
