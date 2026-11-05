### Cold Start Optimization Pattern

Minimize Lambda cold start latency

**When to use**: Latency-sensitive applications,User-facing APIs,High-traffic functions

## 1. Optimize Package Size

```javascript
// Use modular AWS SDK v3 imports
// GOOD - only imports what you need
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// BAD - imports entire SDK
const AWS = require('aws-sdk');  // Don't do this!
```

## 2. Use SnapStart (Java/.NET)

```yaml
# template.yaml
Resources:
  JavaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: com.example.Handler::handleRequest
      Runtime: java21
      SnapStart:
        ApplyOn: PublishedVersions  # Enable SnapStart
      AutoPublishAlias: live
```

## 3. Right-size Memory

```yaml
# More memory = more CPU = faster init
Resources:
  FastFunction:
    Type: AWS::Serverless::Function
    Properties:
      MemorySize: 1024  # 1GB gets full vCPU
      Timeout: 30
```

## 4. Provisioned Concurrency (when needed)

```yaml
Resources:
  CriticalFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/critical.handler
      AutoPublishAlias: live

  ProvisionedConcurrency:
    Type: AWS::Lambda::ProvisionedConcurrencyConfig
    Properties:
      FunctionName: !Ref CriticalFunction
      Qualifier: live
      ProvisionedConcurrentExecutions: 5
```

## 5. Keep Init Light

```python
# GOOD - Lazy initialization
_table = None

def get_table():
    global _table
    if _table is None:
        dynamodb = boto3.resource('dynamodb')
        _table = dynamodb.Table(os.environ['TABLE_NAME'])
    return _table

def handler(event, context):
    table = get_table()  # Only initializes on first use
    # ...
```

### Optimization_priority

- 1: Reduce package size (biggest impact)
- 2: Use SnapStart for Java/.NET
- 3: Increase memory for faster init
- 4: Delay heavy imports
- 5: Provisioned concurrency (last resort)

### SAM Local Development Pattern

Local testing and debugging with SAM CLI

**When to use**: Local development and testing,Debugging Lambda functions,Testing API Gateway locally

```bash
# Install SAM CLI
pip install aws-sam-cli

# Initialize new project
sam init --runtime nodejs20.x --name my-api

# Build the project
sam build

# Run locally
sam local start-api

# Invoke single function
sam local invoke GetItemFunction --event events/get.json

# Local debugging (Node.js with VS Code)
sam local invoke --debug-port 5858 GetItemFunction

# Deploy
sam deploy --guided
```

```json
// events/get.json (test event)
{
  "pathParameters": {
    "id": "123"
  },
  "httpMethod": "GET",
  "path": "/items/123"
}
```

```json
// .vscode/launch.json (for debugging)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to SAM CLI",
      "type": "node",
      "request": "attach",
      "address": "localhost",
      "port": 5858,
      "localRoot": "${workspaceRoot}/src",
      "remoteRoot": "/var/task/src",
      "protocol": "inspector"
    }
  ]
}
```

### Commands

- Sam_build: Build Lambda deployment packages
- Sam_local_start_api: Start local API Gateway
- Sam_local_invoke: Invoke single function
- Sam_deploy: Deploy to AWS
- Sam_logs: Tail CloudWatch logs

### CDK Serverless Pattern

Infrastructure as code with AWS CDK

**When to use**: Complex infrastructure beyond Lambda,Prefer programming languages over YAML,Need reusable constructs

```typescript
// lib/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev only
    });

    // Lambda Function
    const getItemFn = new lambda.Function(this, 'GetItemFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'get.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        TABLE_NAME: table.tableName,
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    // Grant permissions
    table.grantReadData(getItemFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ItemsApi', {
      restApiName: 'Items Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const items = api.root.addResource('items');
    const item = items.addResource('{id}');

    item.addMethod('GET', new apigateway.LambdaIntegration(getItemFn));

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
```

```bash
# CDK commands
npm install -g aws-cdk
cdk init app --language typescript
cdk synth    # Generate CloudFormation
cdk diff     # Show changes
cdk deploy   # Deploy to AWS
```

