# System Architecture

## High-Level Overview

```
                                    ┌─────────────────┐
                                    │                 │
                                    │  Web Browser    │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                             │ HTTPS
                                             ▼
                        ┌────────────────────────────────────┐
                        │                                    │
                        │        React Frontend              │
                        │  - Dashboard                       │
                        │  - Device Search                   │
                        │  - AI Chat                         │
                        │  - Visualizations                  │
                        │                                    │
                        └──────────────┬─────────────────────┘
                                       │
                                       │ REST API
                                       ▼
                        ┌────────────────────────────────────┐
                        │                                    │
                        │     AWS API Gateway                │
                        │  - Authentication                  │
                        │  - Rate Limiting                   │
                        │  - Request Routing                 │
                        │                                    │
                        └──────────────┬─────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
    ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐
    │                   │  │                   │  │                  │
    │  Lambda Function  │  │  Lambda Function  │  │  Lambda Function │
    │  Data Collector   │  │  NLP Processor    │  │  API Handler     │
    │                   │  │                   │  │                  │
    │  - iFixit API     │  │  - GLiNER         │  │  - CRUD Ops      │
    │  - Data Ingestion │  │  - Clustering     │  │  - Query Handler │
    │                   │  │                   │  │                  │
    └─────────┬─────────┘  └─────────┬─────────┘  └────────┬─────────┘
              │                      │                      │
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────┐
                  │                                      │
                  │         DynamoDB Tables              │
                  │                                      │
                  │  ┌─────────────────────────────┐    │
                  │  │ Repair Guides (1,109)       │    │
                  │  ├─────────────────────────────┤    │
                  │  │ Devices (528)               │    │
                  │  ├─────────────────────────────┤    │
                  │  │ Failure Patterns (6,765)    │    │
                  │  ├─────────────────────────────┤    │
                  │  │ Root Causes (215+)          │    │
                  │  ├─────────────────────────────┤    │
                  │  │ Chat History                │    │
                  │  └─────────────────────────────┘    │
                  │                                      │
                  └──────────────────────────────────────┘
                                     │
                                     │ Streams
                                     ▼
                  ┌──────────────────────────────────────┐
                  │                                      │
                  │   Lambda Function                    │
                  │   Stream Processor                   │
                  │                                      │
                  │   - Real-time Aggregation            │
                  │   - Statistics Update                │
                  │                                      │
                  └──────────────────────────────────────┘


    ┌───────────────────────────────────────────────────────┐
    │                                                       │
    │            External Services                          │
    │                                                       │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
    │  │             │  │              │  │             │ │
    │  │ AWS Bedrock │  │   Pinecone   │  │  OpenAI     │ │
    │  │ Claude 3    │  │ Vector DB    │  │ Embeddings  │ │
    │  │ Haiku       │  │              │  │             │ │
    │  │             │  │              │  │             │ │
    │  └─────────────┘  └──────────────┘  └─────────────┘ │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Ingestion Flow
```
iFixit API → Data Collector Lambda → DynamoDB (Guides) → DynamoDB Stream
     ↓
DynamoDB Stream → NLP Processor Lambda → DynamoDB (Patterns)
```

### 2. Query Flow
```
Frontend → API Gateway → API Handler Lambda → DynamoDB → Response → Frontend
```

### 3. Chat Flow
```
User Query → OpenAI Embedding → Pinecone Search → Context Retrieval
     ↓
Context + Query → AWS Bedrock Claude → Streaming Response → Frontend
```

### 4. Root Cause Analysis Flow
```
Repair Guide → Root Cause Analyzer Lambda → AWS Bedrock Claude
     ↓
Analysis Result → DynamoDB (Root Causes)
```

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling:** Tailwind CSS (via inline styles)

### Backend
- **Runtime:** AWS Lambda (Python 3.11)
- **API:** AWS API Gateway (REST)
- **Database:** DynamoDB (5 tables)
- **Vector DB:** Pinecone
- **LLM:** AWS Bedrock (Claude 3 Haiku)
- **Embeddings:** OpenAI text-embedding-3-small

### NLP/ML
- **NER:** GLiNER (zero-shot)
- **Clustering:** Scikit-learn (hierarchical)
- **RAG:** LangChain + Pinecone
- **Prompt Engineering:** Custom templates

## Scalability

- **Serverless:** Auto-scaling Lambda functions
- **Database:** DynamoDB on-demand billing
- **Vector Search:** Pinecone managed service
- **API:** API Gateway with throttling

## Security

- **Authentication:** AWS IAM roles
- **Network:** VPC for Lambda (optional)
- **Data:** Encryption at rest (DynamoDB)
- **API:** Rate limiting via API Gateway
