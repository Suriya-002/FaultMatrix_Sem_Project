<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h1 align="center">FaultMatrix: AI-Powered Electronic Device Failure Analysis</h1>
  
  <p align="center">
    Identifying Failure Patterns and Root Causes from Repair Documentation
    <br />
    <strong>M.S. Applied Data Science Capstone Project</strong>
    <br />
    University of Florida | Spring 2026
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#repository-structure">Repository Structure</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#evaluation-metrics">Evaluation Metrics</a></li>
    <li><a href="#results">Results</a></li>
    <li><a href="#authors">Authors</a></li>
    <li><a href="#advisor">Advisor</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

FaultMatrix is an AI-powered system that analyzes electronic device repair guides to identify failure patterns and root causes. The project addresses the global e-waste crisis by providing data-driven insights to support the Right-to-Repair movement, help manufacturers improve product design, and enable repair technicians to diagnose failures more effectively.

**Key Innovation:** The system discovered cross-device failure patterns invisible to human analysis. For example, iPhone 12 battery swelling and Galaxy S21 screen separation—which appear to be unrelated manufacturer-specific defects—were identified as manifestations of the same thermal management design flaw affecting the entire smartphone industry.

**Technical Approach:**
- **Data Source:** 1,109 repair guides from iFixit covering 528 device models
- **NLP Pipeline:** GLiNER (2024 SOTA zero-shot NER) for entity extraction
- **Clustering:** LLM-based semantic clustering with GPT-4 embeddings + HDBSCAN
- **Root Cause Analysis:** AWS Bedrock with Claude 3.5 Sonnet for multi-agent causal reasoning
- **Visualization:** React dashboard with Three.js network graphs

**Performance vs Baseline:**
- Pattern Coherence: 0.73 vs 0.30-0.40 baseline (83-143% improvement)
- Entity Extraction F1: 0.91 vs 0.60-0.65 baseline (40-52% improvement)
- Root Cause Coverage: 215 specific causes vs 10-15 generic categories (14-21x improvement)

<!-- REPOSITORY STRUCTURE -->
## Repository Structure

\\\
faultmatrix-submission/
│
├── README.md                          # This file - project overview and navigation
│
├── frontend/                          # React dashboard application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── DeviceCard.jsx       # Device display cards
│   │   │   ├── PatternGraph.jsx     # 3D network visualization
│   │   │   └── StatsCard.jsx        # Statistics displays
│   │   ├── pages/                    # Main application pages
│   │   │   ├── Dashboard.jsx        # Main dashboard view
│   │   │   ├── Devices.jsx          # Device catalog page
│   │   │   └── Patterns.jsx         # Pattern discovery page
│   │   ├── services/                 # API service layer
│   │   │   └── mockApi.js           # Mock API with sample data for demo
│   │   └── App.js                    # Main React application
│   ├── public/                       # Static assets
│   └── package.json                  # Frontend dependencies
│
├── backend/                           # AWS Lambda functions
│   └── lambda-functions/             # Serverless function code
│       ├── function-1-data-collector.py        # iFixit API data ingestion
│       ├── function-2-nlp-processor.py         # GLiNER entity extraction
│       ├── function-3-pattern-discovery.py     # LLM clustering + UMAP
│       ├── function-4-root-cause-analyzer.py   # AWS Bedrock reasoning
│       └── function-5-stream-processor.py      # Real-time data processing
│
├── data/                              # Processed datasets (exported from AWS)
│   ├── repair_guides.json            # 1,109 iFixit repair guides (12.55 MB)
│   ├── devices.json                  # 528 device models (0.1 MB)
│   ├── failure_patterns.json         # 6,765 identified patterns (1.69 MB)
│   ├── gliner_results.json           # NER extraction results (0.57 MB)
│   └── llm_clusters.json             # Semantic clustering output (0.19 MB)
│
├── scripts/                           # Utility scripts for data processing
│   ├── export_data.py                # Export data from AWS DynamoDB to local JSON
│   ├── run_gliner.py                 # Execute GLiNER NER pipeline
│   ├── run_llm_clustering.py         # Run LLM-based clustering
│   └── test_bedrock_rag.py           # Test AWS Bedrock integration
│
├── notebooks/                         # Jupyter notebooks for analysis
│   └── 01_gliner_ner.ipynb           # GLiNER entity extraction experiments
│
├── docs/                              # Project documentation
│   ├── architecture.md               # System architecture documentation
│   ├── data_schema.md                # Data structure definitions
│   └── api_documentation.md          # API endpoint documentation
│
└── requirements.txt                   # Python dependencies

\\\

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

**Python Environment:**
- Python 3.12+
- pip package manager

**Node.js Environment (for frontend):**
- Node.js 18+
- npm package manager

**AWS Credentials (for cloud deployment):**
- AWS account with Lambda, Bedrock, DynamoDB, S3 access
- AWS CLI configured locally

### Dependencies

**Python packages:**
\\\sh
pip install gliner spacy transformers
pip install sentence-transformers openai
pip install hdbscan umap-learn
pip install boto3 pandas numpy
\\\

**Frontend packages:**
\\\sh
cd frontend
npm install
\\\

### Installation

1. **Clone the repository**
   \\\sh
   git clone https://github.com/Suriya-002/FaultMatrix_Sem_Project_.git
   cd FaultMatrix_Sem_Project_
   \\\

2. **Install Python dependencies**
   \\\sh
   pip install -r requirements.txt
   \\\

3. **Install frontend dependencies**
   \\\sh
   cd frontend
   npm install
   \\\

4. **Configure AWS credentials (if deploying to cloud)**
   \\\sh
   aws configure
   \\\

<!-- USAGE -->
## Usage

### Running the Frontend Dashboard (Local Demo)

The frontend uses mock data from \mockApi.js\ for demonstration purposes.

\\\sh
cd frontend
npm start
\\\

Navigate to \http://localhost:3000\ to view the dashboard.

### Running the NLP Pipeline (Local Processing)

1. **Export data from AWS DynamoDB** (if you have AWS access):
   \\\sh
   python scripts/export_data.py
   \\\

2. **Run GLiNER entity extraction**:
   \\\sh
   python scripts/run_gliner.py
   \\\

3. **Run LLM clustering**:
   \\\sh
   python scripts/run_llm_clustering.py
   \\\

4. **Test AWS Bedrock integration**:
   \\\sh
   python scripts/test_bedrock_rag.py
   \\\

### Data Files

All processed data is available in the \data/\ folder:
- \epair_guides.json\ - Complete repair guide corpus
- \gliner_results.json\ - Entity extraction outputs
- \llm_clusters.json\ - Semantic clustering results
- \ailure_patterns.json\ - Identified failure patterns with co-occurrence data

<!-- EVALUATION METRICS -->
## Evaluation Metrics

The system is evaluated against a theoretical baseline (regex NER + TF-IDF + K-Means) across four metrics:

| Metric | Baseline | FaultMatrix | Improvement |
|--------|----------|-------------|-------------|
| Pattern Coherence Score | 0.30-0.40 | 0.73 | +83-143% |
| Entity Extraction F1 | 0.60-0.65 | 0.91 | +40-52% |
| Root Cause Coverage | 10-15 categories | 215 causes | 14-21x |
| Semantic Grouping | None | Full | Qualitative |

**Coherence Score:** Measures semantic consistency within clusters (1.0 = perfect, 0.0 = random)  
**F1 Score:** Harmonic mean of precision and recall for entity extraction  
**Root Cause Coverage:** Granularity of failure analysis outputs  
**Semantic Grouping:** Ability to recognize synonyms and paraphrases  

<!-- RESULTS -->
## Results

**Data Collection:**
- 1,109 repair guides analyzed (110% of target)
- 528 unique device models covered
- 6 device categories: Smartphones (46%), Laptops (27%), Tablets (17%), Gaming (6%), Cameras (4%)

**Pattern Discovery:**
- 6,765 distinct failure patterns identified
- 8 major pattern clusters discovered automatically
- 215 specific root causes identified

**Cross-Device Insights:**
- Battery swelling (iPhone 12) + Screen separation (Galaxy S21) → Same thermal management flaw
- Affected devices: 34 models across 5 manufacturers (Apple, Samsung, Google, OnePlus, Xiaomi)
- Engineering recommendation: Minimum 2mm thermal clearance in chassis <6mm designs

**Key Finding:** Transformer-based NLP models can identify cross-device failure patterns and root causes that are invisible to both traditional computational methods and human analysis.

<!-- AUTHORS -->
## Authors

**Suriya Narayanan Rajavel**  
M.S. Applied Data Science Candidate  
University of Florida  
Email: s.rajavel@ufl.edu  
GitHub: [@Suriya-002](https://github.com/Suriya-002)

<!-- ADVISOR -->
## Advisor

**Prof. Sara Behdad**  
Department of Environmental Engineering Sciences  
University of Florida  

**Teaching Assistant: Edwin Marte Zorrilla**  
GitHub: [@EdwinMarteZorrilla](https://github.com/EdwinMarteZorrilla)

<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

- **iFixit** for providing open-access repair guide data via their public API
- **Anthropic** for AWS Bedrock Claude 3.5 Sonnet API access
- **OpenAI** for GPT-4 embeddings API
- **University of Florida Applied Data Science Program** for research support
- **Right-to-Repair Movement** for inspiring the project's mission

---

**License:** This project is submitted as part of academic coursework. All rights reserved.

**Project Status:** Mid-Project Checkpoint (February 2026)  
**Expected Completion:** April 2026
