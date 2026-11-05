---
name: aws-serverless
description: "Build production-ready serverless apps on AWS: Lambda, API Gateway, DynamoDB, SQS/SNS event-driven patterns, SAM/CDK deployment and cold-start optimization. Use when designing, building or debugging AWS serverless systems."
---


# AWS Serverless

Specialized skill for building production-ready serverless applications on AWS.
Covers Lambda functions, API Gateway, DynamoDB, SQS/SNS event-driven patterns,
SAM/CDK deployment, and cold start optimization.

## Principles

- Right-size memory and timeout (measure before optimizing)
- Minimize cold starts for latency-sensitive workloads
- Use SnapStart for Java/.NET functions
- Prefer HTTP API over REST API for simple use cases
- Design for failure with DLQs and retries
- Keep deployment packages small
- Use environment variables for configuration
- Implement structured logging with correlation IDs

## References

Read these on demand; they hold the full patterns, code and checks.

- [references/lambda-and-api-gateway-patterns.md](references/lambda-and-api-gateway-patterns.md): read this when writing a Lambda handler or wiring API Gateway (SAM templates, HTTP vs REST).
- [references/sqs-and-dynamodb-streams-patterns.md](references/sqs-and-dynamodb-streams-patterns.md): read this when building SQS consumers, DLQs or DynamoDB Streams processing.
- [references/cold-start-sam-and-cdk.md](references/cold-start-sam-and-cdk.md): read this when optimizing cold starts, running SAM locally or deploying with CDK.
- [references/sharp-edges-runtime-and-limits.md](references/sharp-edges-runtime-and-limits.md): read this when hitting INIT billing, timeouts or OOM crashes.
- [references/sharp-edges-networking-and-loops.md](references/sharp-edges-networking-and-loops.md): read this when dealing with VPC cold starts, event loop hangs, payload limits or recursive invocations.
- [references/validation-checks.md](references/validation-checks.md): read this when reviewing code for credentials, IAM, error handling, memory, timeout, DLQ and SDK issues.

## Collaboration

### Delegation Triggers

- user needs GCP serverless -> gcp-cloud-run (Cloud Run for containers, Cloud Functions for events)
- user needs Azure serverless -> azure-functions (Azure Functions, Logic Apps)
- user needs database design -> postgres-wizard (RDS design, or use DynamoDB patterns)
- user needs authentication -> auth-specialist (Cognito, API Gateway authorizers)
- user needs complex workflows -> workflow-automation (Step Functions, EventBridge)
- user needs AI integration -> llm-architect (Lambda calling Bedrock or external LLMs)

## When to Use
Use this skill when the request clearly matches the capabilities and patterns described above.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
