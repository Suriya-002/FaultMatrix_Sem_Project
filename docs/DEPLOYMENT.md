# Deployment Guide

## AWS Deployment

### Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI configured
3. Python 3.11+
4. Node.js 18+

### Step 1: Create DynamoDB Tables

```bash
# Repair Guides Table
aws dynamodb create-table \
  --table-name faultmatrix-repair-guides-dev \
  --attribute-definitions AttributeName=guide_id,AttributeType=S \
  --key-schema AttributeName=guide_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Devices Table
aws dynamodb create-table \
  --table-name faultmatrix-devices-dev \
  --attribute-definitions AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=device_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Failure Patterns Table
aws dynamodb create-table \
  --table-name faultmatrix-failure-patterns-dev \
  --attribute-definitions AttributeName=pattern_id,AttributeType=S \
  --key-schema AttributeName=pattern_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Root Causes Table
aws dynamodb create-table \
  --table-name faultmatrix-root-causes-dev \
  --attribute-definitions AttributeName=guide_id,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=guide_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Chat History Table
aws dynamodb create-table \
  --table-name faultmatrix-chat-history-dev \
  --attribute-definitions AttributeName=session_id,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=session_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Step 2: Create IAM Role for Lambda

```bash
aws iam create-role \
  --role-name faultmatrix-lambda-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name faultmatrix-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name faultmatrix-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

### Step 3: Deploy Lambda Functions

```bash
cd backend/lambda-functions

# For each function:
pip install -r ../requirements.txt -t .
zip -r function.zip .
aws lambda create-function \
  --function-name faultmatrix-[function-name]-dev \
  --runtime python3.11 \
  --role arn:aws:iam::[ACCOUNT_ID]:role/faultmatrix-lambda-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 1024
```

### Step 4: Create API Gateway

```bash
aws apigateway create-rest-api \
  --name faultmatrix-api-dev \
  --description "FaultMatrix REST API"

# Configure routes and integrate with Lambda functions
```

### Step 5: Deploy Frontend

```bash
cd frontend
npm run build

# Deploy to S3 + CloudFront or Vercel
```

## Local Development

```bash
# Frontend only (mock data)
cd frontend
npm install
npm run dev

# Backend testing
cd backend/lambda-functions
python -m pytest tests/
```

## Environment Variables

Lambda functions require:
- `DYNAMODB_GUIDES_TABLE`
- `DYNAMODB_DEVICES_TABLE`
- `DYNAMODB_PATTERNS_TABLE`
- `DYNAMODB_ROOT_CAUSES_TABLE`
- `DYNAMODB_CHAT_HISTORY_TABLE`

## Monitoring

- CloudWatch Logs for Lambda execution
- DynamoDB metrics in CloudWatch
- API Gateway request logs

## Troubleshooting

### Lambda Timeout
- Increase timeout in Lambda configuration
- Optimize batch sizes

### DynamoDB Throttling
- Check read/write capacity
- Enable auto-scaling if needed

### CORS Issues
- Verify API Gateway CORS configuration
- Check allowed origins in Lambda responses
