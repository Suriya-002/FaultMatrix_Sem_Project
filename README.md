# FaultMatrix: Every Failure Has a Pattern

**Intelligent Device Failure Pattern Analysis System**

[![University of Florida](https://img.shields.io/badge/University-Florida-orange)](https://www.ufl.edu/)
[![M.S. Applied Data Science](https://img.shields.io/badge/Program-MS%20Applied%20Data%20Science-blue)](https://www.eng.ufl.edu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Project Overview

FaultMatrix is an end-to-end AI system that analyzes device failure patterns from repair documentation to support Right-to-Repair legislation and sustainable product design. The system processes 1,109 repair guides covering 528 devices using multi-stage NLP and LLM-powered root cause analysis.

### Key Statistics
- **1,109** repair guides analyzed
- **528** unique devices
- **6,765** failure patterns identified
- **215+** root cause analyses
- **83** device clusters

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  Dashboard │ Devices │ AI Chat │ Visualizations          │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  API Gateway (AWS)                       │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Lambda 1 │   │ Lambda 2 │   │ Lambda 3 │
   │   Data   │   │   NLP    │   │   API    │
   │Collector │   │Processor │   │ Handler  │
   └──────────┘   └──────────┘   └──────────┘
          │              │              │
          └──────────────┼──────────────┘
                         ▼
           ┌─────────────────────────┐
           │   DynamoDB (5 Tables)   │
           │ - Guides                │
           │ - Devices               │
           │ - Patterns              │
           │ - Root Causes           │
           │ - Chat History          │
           └─────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- AWS Account (for cloud deployment)

### Local Setup

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/faultmatrix.git
cd faultmatrix
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

#### 3. Backend Setup (Optional for local testing)
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Demo (No AWS Required)

The frontend works standalone with mock data:
```bash
cd faultmatrix-submission/frontend
npm install
npm run dev
```

This provides a fully functional UI demonstrating:
- Dashboard with failure statistics
- Device search and filtering
- Failure pattern visualization
- AI chat interface (demo responses)

---

## 📁 Repository Structure

```
faultmatrix-submission/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── services/     # API and mock data services
│   │   └── mock-data/    # Local JSON data for demo
│   └── package.json
├── backend/               # AWS Lambda functions
│   ├── lambda-functions/ # 5 Python Lambda functions
│   └── requirements.txt  # Python dependencies
├── data/                  # Sample datasets
│   └── sample/
├── docs/                  # Documentation & diagrams
│   └── architecture/
└── README.md              # This file
```

---

## 🧩 Components

### Frontend
- **Tech Stack:** React 18, Vite, Recharts, Lucide Icons
- **Features:**
  - Real-time dashboard with interactive charts
  - Device search and detail views
  - AI-powered chat interface
  - Dark "Tech Lab" theme
  - Responsive design

### Backend (AWS Lambda)
1. **Data Collector:** iFixit API integration
2. **NLP Processor:** Entity extraction & clustering
3. **API Handler:** REST endpoints for frontend
4. **Stream Processor:** Real-time aggregation
5. **Root Cause Analyzer:** LLM-powered analysis (Claude 3 Haiku)

### Data Pipeline
- **Source:** iFixit API (100,000+ repair guides)
- **NLP:** GLiNER for zero-shot entity recognition
- **Clustering:** Hierarchical clustering (83 device families)
- **LLM Analysis:** AWS Bedrock Claude 3 Haiku
- **Storage:** DynamoDB (5 tables, on-demand billing)
- **Vector DB:** Pinecone (768-dim OpenAI embeddings)

---

## 📊 Key Features

### 1. Intelligent Entity Extraction
- Zero-shot NER with GLiNER
- 87% F1-score on technical terminology
- Extracts: components, tools, failure indicators

### 2. Root Cause Analysis
- LLM-powered analysis using Claude 3 Haiku
- Identifies WHY failures occur (not just WHAT)
- Provides: evidence, frequency, fixability, prevention tips

### 3. RAG-Powered Chat
- Conversational query interface
- Sub-3-second response time
- Context-aware with memory
- Cites sources from repair guides

### 4. Visual Analytics
- Interactive dashboards with Recharts
- Device family clustering visualization
- Temporal failure trend analysis
- Component frequency heatmaps

---

## 🎓 Academic Context

**Student:** Suriya Narayanan Rajavel  
**Program:** M.S. Applied Data Science  
**Institution:** University of Florida  
**Advisor:** Professor Sara Behdad  
**Department:** Environmental Engineering Sciences  
**Semester:** Spring 2026  

**Project Goals:**
- Support Right-to-Repair legislation with data-driven insights
- Advance sustainable product design through failure analysis
- Demonstrate viability of AI for circular economy applications
- Provide accessible failure knowledge to diverse stakeholders

---

## 📈 Results

### Entity Extraction Performance
| Method | Precision | Recall | F1 |
|--------|-----------|--------|-----|
| Rule-based | 0.72 | 0.58 | 0.64 |
| spaCy NER | 0.65 | 0.51 | 0.57 |
| BERT NER | 0.78 | 0.69 | 0.73 |
| **GLiNER** | **0.89** | **0.85** | **0.87** |

### Root Cause Analysis
- **Coverage:** 100% of processed guides
- **Mean Latency:** 2.74s
- **Valid Responses:** 100%

### RAG System
- **Query Latency:** 2.89s (mean)
- **Retrieval Accuracy:** 0.82 NDCG@5
- **User Preference:** 83% prefer RAG over direct LLM

---

## 🔧 Technologies

### Frontend
- React 18
- Vite
- Recharts
- React Router
- Lucide React Icons

### Backend
- AWS Lambda (Python 3.11)
- AWS Bedrock (Claude 3 Haiku)
- DynamoDB
- API Gateway
- Pinecone
- OpenAI Embeddings

### NLP/ML
- GLiNER (Zero-shot NER)
- Hierarchical Clustering
- TF-IDF Vectorization
- RAG Architecture

---

## 📝 Demo Video

🎥 [Watch 2-Minute Demo](INSERT_VIDEO_LINK_HERE)

The video demonstrates:
- Dashboard overview with statistics
- Device search and filtering
- Failure pattern visualization
- AI chat interaction
- Root cause analysis display

---

## 🔮 Future Work

1. **Temporal Failure Modeling:** Predict failure progression over time
2. **Multi-Modal Analysis:** Incorporate repair images/videos
3. **Causal Inference:** Distinguish correlation from causation
4. **Cross-Domain Transfer:** Extend to automotive/aerospace/medical devices
5. **Real-Time Monitoring:** Integrate IoT sensor data for predictive maintenance

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Professor Sara Behdad** for project guidance and domain expertise
- **iFixit Community** for maintaining open-source repair documentation
- **University of Florida** M.S. Applied Data Science program
- **Anthropic** for Claude API access via AWS Bedrock

---

## 📧 Contact

**Suriya Narayanan Rajavel**  
M.S. Applied Data Science  
University of Florida  
Email: s.rajavel@ufl.edu  
GitHub: [YOUR_GITHUB_USERNAME]

---

## 📚 Citations

If you use this work in your research, please cite:

```bibtex
@mastersthesis{rajavel2026faultmatrix,
  title={FaultMatrix: Intelligent Device Failure Pattern Analysis Using Multi-Agent AI},
  author={Rajavel, Suriya Narayanan},
  year={2026},
  school={University of Florida}
}
```

---

**Built with ❤️ at the University of Florida**
