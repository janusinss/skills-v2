### Node.js Event Loop Not Cleared

Severity: MEDIUM

Situation: Node.js Lambda function with callbacks or timers

Symptoms:
Function takes full timeout duration to return.
"Task timed out" even though logic completed.
Extra billing for idle time.

Why this breaks:
By default, Lambda waits for the Node.js event loop to be empty
before returning. If you have:
- Unresolved setTimeout/setInterval
- Dangling database connections
- Pending callbacks

Lambda waits until timeout, even if your response was ready.

Recommended fix:

## Tell Lambda not to wait for event loop

```javascript
exports.handler = async (event, context) => {
  // Don't wait for event loop to clear
  context.callbackWaitsForEmptyEventLoop = false;

  // Your code here
  const result = await processRequest(event);

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

## Close connections properly

```javascript
// For database connections, use connection pooling
// or close connections explicitly

const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const connection = await mysql.createConnection({...});
  try {
    const [rows] = await connection.query('SELECT * FROM users');
    return { statusCode: 200, body: JSON.stringify(rows) };
  } finally {
    await connection.end();  // Always close
  }
};
```

### API Gateway Payload Size Limits

Severity: MEDIUM

Situation: Returning large responses or receiving large requests

Symptoms:
"413 Request Entity Too Large" error
"Execution failed due to configuration error: Malformed Lambda proxy response"
Response truncated or failed

Why this breaks:
API Gateway has hard payload limits:
- REST API: 10 MB request/response
- HTTP API: 10 MB request/response
- Lambda itself: 6 MB sync response, 256 KB async

Exceeding these causes failures that may not be obvious.

Recommended fix:

## For large file uploads

```javascript
// Use presigned S3 URLs instead of passing through API Gateway

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.handler = async (event) => {
  const s3 = new S3Client({});

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/${Date.now()}.file`
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  };
};
```

## For large responses

```javascript
// Store in S3, return presigned download URL
exports.handler = async (event) => {
  const largeData = await generateLargeReport();

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `reports/${reportId}.json`,
    Body: JSON.stringify(largeData)
  }));

  const downloadUrl = await getSignedUrl(s3,
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `reports/${reportId}.json`
    }),
    { expiresIn: 3600 }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ downloadUrl })
  };
};
```

### Infinite Loop or Recursive Invocation

Severity: HIGH

Situation: Lambda triggered by events

Symptoms:
Runaway costs.
Thousands of invocations in minutes.
CloudWatch logs show repeated invocations.
Lambda writing to source bucket/table that triggers it.

Why this breaks:
Lambda can accidentally trigger itself:
- S3 trigger writes back to same bucket
- DynamoDB trigger updates same table
- SNS publishes to topic that triggers it
- Step Functions with wrong error handling

Recommended fix:

## Use different buckets/prefixes

```yaml
# S3 trigger with prefix filter
Events:
  S3Event:
    Type: S3
    Properties:
      Bucket: !Ref InputBucket
      Events: s3:ObjectCreated:*
      Filter:
        S3Key:
          Rules:
            - Name: prefix
              Value: uploads/  # Only trigger on uploads/

# Output to different bucket or prefix
# OutputBucket or processed/ prefix
```

## Add idempotency checks

```javascript
exports.handler = async (event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key;

    // Skip if this is a processed file
    if (key.startsWith('processed/')) {
      console.log('Skipping already processed file:', key);
      continue;
    }

    // Process and write to different location
    await processFile(key);
    await writeToS3(`processed/${key}`, result);
  }
};
```

## Set reserved concurrency as circuit breaker

```yaml
Resources:
  RiskyFunction:
    Type: AWS::Serverless::Function
    Properties:
      ReservedConcurrentExecutions: 10  # Max 10 parallel
      # Limits blast radius of runaway invocations
```

## Monitor with CloudWatch alarms

```yaml
InvocationAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    MetricName: Invocations
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 60
    EvaluationPeriods: 1
    Threshold: 1000  # Alert if >1000 invocations/min
    ComparisonOperator: GreaterThanThreshold
```

