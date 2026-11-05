## Sharp Edges

### Cold Start INIT Phase Now Billed (Aug 2025)

Severity: HIGH

Situation: Running Lambda functions in production

Symptoms:
Unexplained increase in Lambda costs (10-50% higher).
Bill includes charges for function initialization.
Functions with heavy startup logic cost more than expected.

Why this breaks:
As of August 1, 2025, AWS bills the INIT phase the same way it bills
invocation duration. Previously, cold start initialization wasn't billed
for the full duration.

This affects functions with:
- Heavy dependency loading (large packages)
- Slow initialization code
- Frequent cold starts (low traffic or poor concurrency)

Cold starts now directly impact your bill, not just latency.

Recommended fix:

## Measure your INIT phase

```bash
# Check CloudWatch Logs for INIT_REPORT
# Look for Init Duration in milliseconds

# Example log line:
# INIT_REPORT Init Duration: 423.45 ms
```

## Reduce INIT duration

```javascript
// 1. Minimize package size
// Use tree shaking, exclude dev dependencies
// npm prune --production

// 2. Lazy load heavy dependencies
let heavyLib = null;
function getHeavyLib() {
  if (!heavyLib) {
    heavyLib = require('heavy-library');
  }
  return heavyLib;
}

// 3. Use AWS SDK v3 modular imports
const { S3Client } = require('@aws-sdk/client-s3');
// NOT: const AWS = require('aws-sdk');
```

## Use SnapStart for Java/.NET

```yaml
Resources:
  JavaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: java21
      SnapStart:
        ApplyOn: PublishedVersions
```

## Monitor cold start frequency

```javascript
// Track cold starts with custom metric
let isColdStart = true;

exports.handler = async (event) => {
  if (isColdStart) {
    console.log('COLD_START');
    // CloudWatch custom metric here
    isColdStart = false;
  }
  // ...
};
```

### Lambda Timeout Misconfiguration

Severity: HIGH

Situation: Running Lambda functions, especially with external calls

Symptoms:
Function times out unexpectedly.
"Task timed out after X seconds" in logs.
Partial processing with no response.
Silent failures with no error caught.

Why this breaks:
Default Lambda timeout is only 3 seconds. Maximum is 15 minutes.

Common timeout causes:
- Default timeout too short for workload
- Downstream service taking longer than expected
- Network issues in VPC
- Infinite loops or blocking operations
- S3 downloads larger than expected

Lambda terminates at timeout without graceful shutdown.

Recommended fix:

## Set appropriate timeout

```yaml
# template.yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Timeout: 30  # Seconds (max 900)
      # Set to expected duration + buffer
```

## Implement timeout awareness

```javascript
exports.handler = async (event, context) => {
  // Get remaining time
  const remainingTime = context.getRemainingTimeInMillis();

  // If running low on time, fail gracefully
  if (remainingTime < 5000) {
    console.warn('Running low on time, aborting');
    throw new Error('Insufficient time remaining');
  }

  // For long operations, check periodically
  for (const item of items) {
    if (context.getRemainingTimeInMillis() < 10000) {
      // Save progress and exit gracefully
      await saveProgress(processedItems);
      throw new Error('Timeout approaching, saved progress');
    }
    await processItem(item);
  }
};
```

## Set downstream timeouts

```javascript
const axios = require('axios');

// Always set timeouts on HTTP calls
const response = await axios.get('https://api.example.com/data', {
  timeout: 5000  // 5 seconds
});
```

### Out of Memory (OOM) Crash

Severity: HIGH

Situation: Lambda function processing data

Symptoms:
Function stops abruptly without error.
CloudWatch logs appear truncated.
"Max Memory Used" hits configured limit.
Inconsistent behavior under load.

Why this breaks:
When Lambda exceeds memory allocation, AWS forcibly terminates
the runtime. This happens without raising a catchable exception.

Common causes:
- Processing large files in memory
- Memory leaks across invocations
- Buffering entire response bodies
- Heavy libraries consuming too much memory

Recommended fix:

## Increase memory allocation

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      MemorySize: 1024  # MB (128-10240)
      # More memory = more CPU too
```

## Stream large data

```javascript
// BAD - loads entire file into memory
const data = await s3.getObject(params).promise();
const content = data.Body.toString();

// GOOD - stream processing
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({});

const response = await s3.send(new GetObjectCommand(params));
const stream = response.Body;

// Process stream in chunks
for await (const chunk of stream) {
  await processChunk(chunk);
}
```

## Monitor memory usage

```javascript
exports.handler = async (event, context) => {
  const used = process.memoryUsage();
  console.log('Memory:', {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB'
  });
  // ...
};
```

## Use Lambda Power Tuning

```bash
# Find optimal memory setting
# https://github.com/alexcasalboni/aws-lambda-power-tuning
```

### VPC-Attached Lambda Cold Start Delay

Severity: MEDIUM

Situation: Lambda functions in VPC accessing private resources

Symptoms:
Extremely slow cold starts (was 10+ seconds, now ~100ms).
Timeouts on first invocation after idle period.
Functions work in VPC but slow compared to non-VPC.

Why this breaks:
Lambda functions in VPC need Elastic Network Interfaces (ENIs).
AWS improved this significantly with Hyperplane ENIs, but:

- First cold start in VPC still has overhead
- NAT Gateway issues can cause timeouts
- Security group misconfig blocks traffic
- DNS resolution can be slow

Recommended fix:

## Verify VPC configuration

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2  # Multiple AZs

  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Lambda SG
      VpcId: !Ref VPC
      SecurityGroupEgress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0  # Allow HTTPS outbound
```

## Use VPC endpoints for AWS services

```yaml
# Avoid NAT Gateway for AWS service calls
DynamoDBEndpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    ServiceName: !Sub com.amazonaws.${AWS::Region}.dynamodb
    VpcId: !Ref VPC
    RouteTableIds:
      - !Ref PrivateRouteTable
    VpcEndpointType: Gateway

S3Endpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    ServiceName: !Sub com.amazonaws.${AWS::Region}.s3
    VpcId: !Ref VPC
    VpcEndpointType: Gateway
```

## Only use VPC when necessary

Don't attach Lambda to VPC unless you need:
- Access to RDS/ElastiCache in VPC
- Access to private EC2 instances
- Compliance requirements

Most AWS services can be accessed without VPC.

