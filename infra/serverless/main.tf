///////////////////////////////////////////
///////////// DynamoDB ///////////////////
//////////////////////////////////////////
resource "aws_dynamodb_table" "audio_sync" {
  name         = "audio_sync_x"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "video_id"

  attribute {
    name = "video_id"
    type = "S"
  }
}

///////////////////////////////////////////
///////////// Create S3 Bucket ///////////
//////////////////////////////////////////
resource "aws_s3_bucket" "audio_sync_s3" {
  bucket        = "audio-sync-s3-bucket-prem"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "audio_sync_s3_versioning" {
  bucket = aws_s3_bucket.audio_sync_s3.id
  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_policy" "audio_sync_s3_policy" {
  bucket = aws_s3_bucket.audio_sync_s3.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = "*",
        Action = [
          "s3:GetObject",
        ],
        Resource = [
          aws_s3_bucket.audio_sync_s3.arn,
          "${aws_s3_bucket.audio_sync_s3.arn}/*",
        ],
      },
    ],
  })
}


///////////////////////////////////////////
///////////// Create SQS  /////////////////
//////////////////////////////////////////
resource "aws_sqs_queue" "audio_sync_fifo_queue" {
  name                        = "audio_sync_queue.fifo"
  fifo_queue                  = true
  visibility_timeout_seconds  = 900
  content_based_deduplication = true
}

///////////////////////////////////////////
///////////// Ecr Repository //////////////
//////////////////////////////////////////
resource "aws_ecr_repository" "audio_sync_ecr" {
  name                 = "audio_sync"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true
}


////////////////////////////////////////////
///////// IAM Policy For Lambda ////////////
///////////////////////////////////////////
resource "aws_iam_role" "lambda_role" {
  name               = "lambda_role"
  assume_role_policy = templatefile("${path.module}/lambda_policy.json.tpl", {})
}

///////////////////////////////////////
///////// Attach Policies ////////////
/////////////////////////////////////
resource "aws_iam_role_policy_attachment" "s3_lambda_execution_policies" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonS3ObjectLambdaExecutionRolePolicy"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "cloudwatch_policies" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "s3_policies" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "sqs_execution_policies" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

////////////////////////////////////////////
///////// Create Lambda Function //////////
///////////////////////////////////////////
# We use this to create the lambda function as using the newly created ecr wouldn't work since it is empty
# we also use this as our image uri as we don't want to automate docker builds and push with terraform
data "aws_ecr_repository" "pre-exiting-ecr" {
  name = var.aws_preexisting_ecr
}

resource "aws_lambda_function" "audio_sync_lambda_function" {
  function_name = "audio_sync"
  architectures = ["arm64"]
  package_type = "Image"
  image_uri     ="${data.aws_ecr_repository.pre-exiting-ecr.repository_url}:latest"
  memory_size   = 1024
  timeout       = 900
  role          = aws_iam_role.lambda_role.arn

  logging_config {
    log_format = "JSON"
  }

  depends_on = [ aws_ecr_repository.audio_sync_ecr ]
}

////////////////////////////////////////////
//// Set SQS As Event Source For Lambda ////
///////////////////////////////////////////
resource "aws_lambda_event_source_mapping" "sqs_event_source_mapping" {
  event_source_arn = aws_sqs_queue.audio_sync_fifo_queue.arn
  function_name    = aws_lambda_function.audio_sync_lambda_function.arn
  enabled          = true
  batch_size       = 5
}