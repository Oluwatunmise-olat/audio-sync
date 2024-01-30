output "sqs_url" {
  value = aws_sqs_queue.audio_sync_fifo_queue.url
}

output "ecr_repository_url" {
  value = aws_ecr_repository.audio_sync_ecr.repository_url
}

output "lambda_function_name" {
  value = aws_lambda_function.audio_sync_lambda_function.function_name
}