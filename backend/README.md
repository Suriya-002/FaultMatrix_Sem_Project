# FaultMatrix Backend

## Lambda Functions

### 1. Data Collector (`function-1-data-collector.py`)
- **Purpose:** Fetch repair guides from iFixit API
- **Trigger:** Manual invocation or EventBridge schedule
- **Environment Variables:**
  - `DYNAMODB_GUIDES_TABLE`
  - `DYNAMODB_DEVICES_TABLE`

### 2. NLP Processor (`function-2-nlp-processor.py`)
- **Purpose:** Extract entities and identify failure patterns
- **Trigger:** Manual invocation after data collection
- **Environment Variables:**
  - `DYNAMODB_GUIDES_TABLE`
  - `DYNAMODB_PATTERNS_TABLE`

### 3. API Handler (`function-3-api-handler.py`)
- **Purpose:** REST API endpoints for frontend
- **Trigger:** API Gateway
- **Endpoints:**
  - `GET /devices` - List all devices
  - `GET /devices/{id}` - Device details
  - `GET /stats` - Dashboard statistics

### 4. Stream Processor (`function-4-stream-processor.py`)
- **Purpose:** Real-time aggregation on DynamoDB events
- **Trigger:** DynamoDB Streams

### 5. Root Cause Analyzer (`function-5-root-cause-analyzer.py`)
- **Purpose:** LLM-powered root cause analysis
- **Trigger:** Manual invocation
- **Model:** AWS Bedrock Claude 3 Haiku

## Deployment

```bash
# Install dependencies
pip install -r requirements.txt -t .

# Create deployment package
zip -r function.zip .

# Deploy to AWS Lambda
aws lambda update-function-code --function-name <function-name> --zip-file fileb://function.zip
```

## IAM Permissions Required

- DynamoDB: GetItem, PutItem, Query, Scan, UpdateItem
- Bedrock: InvokeModel
- CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents
