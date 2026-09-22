# THREAT ASSIST

> **Dark Web Threat Actor De-anonymization & Identity Correlation System**  
> *Smart India Hackathon (SIH 2026) Academic Prototype*

---

## 1. Project Overview & Problem Statement
In cybercrime investigations on darknet forums, ransomware negotiation portals, and encrypted channels, threat actors frequently rotate aliases and compartmentalize their infrastructure. However, operational security (OPSEC) failures often lead to fragmented digital footprints:
- Reused Bitcoin/Ethereum/Monero deposit addresses.
- Reused PGP public keys across distinct pseudonyms.
- Syntactically similar aliases and handle variants.
- Shared hidden services, escrow domains, and forum registrations.

**THREAT ASSIST** correlates these fragmented footprints using an explainable, multi-factor heuristic scoring engine combined with a calibrated machine learning classifier and graph-based network analysis to surface probable identity linkages.

> **CRITICAL ETHICAL & ACADEMIC NOTICE:**  
> This system is an academic research prototype. It operates **strictly on synthetic, locally simulated demonstration data**. It **does NOT** access live darknet marketplaces, does not conduct real-world surveillance, and does not perform real identity tracking.

---

## 2. Architecture & Tech Stack

```
Frontend (React + Vite + Tailwind CSS + Cytoscape.js)
                      │
           REST API (HTTP / JSON)
                      │
   Backend API (Python 3.12 + FastAPI + Uvicorn)
         │                         │
         ▼                         ▼
Matching Engine & ML       Database Layer
(RapidFuzz, Scikit-Learn,   (MongoDB with automatic
 NetworkX Graph)             Local JSON Persistent Fallback)
```

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React, Cytoscape.js
- **Backend API**: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **Data Layer**: MongoDB (via `motor`/`pymongo`) with automatic local persistent document store fallback (`threat_assist_db.json`)
- **Matching & Analysis**: RapidFuzz (fuzzy token matching), Scikit-Learn (calibrated ML classifier), NetworkX (topological graph traversal)

---

## 3. Quick Start Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- *(Optional)* MongoDB running on default port `27017` or Docker. If MongoDB is not running, the application automatically uses its local persistent document store without any setup.

### Step 1: Start the Backend
```bash
# In project root:
cd backend
python -m pip install -r requirements.txt

# Start FastAPI server:
python -m uvicorn backend.app.main:app --reload --port 8000
```
- API Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Step 2: Start the Frontend
```bash
# In a new terminal, navigate to frontend:
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

### (Optional) Docker Compose
```bash
docker-compose up -d
```

---

## 4. SIH Demonstration Workflow (3-Minute Judging Script)

Follow this exact walkthrough during your presentation:

1. **Open the Dashboard (`/`)**:
   - Show the 4 core cyber intelligence cards (25 Synthetic Actors, 154 Footprints, 233 Graph Relationships, Risk breakdown).
2. **Review the Actor Database**:
   - Navigate to **Actor Database**. Filter by `CRITICAL` risk.
   - Search `ShadowFox` and click to view **ACT-001**'s dossier (wallets, PGP keys, onion links).
3. **Run Identity Correlation**:
   - Go to **Identity Correlation**.
   - Select **Target A (`ACT-001 ShadowFox`)** and **Target B (`ACT-002 Shadow_Fox`)**.
   - Review the **Correlation Score: ~92% (Confirmed Match Candidate)**.
   - Show **Supporting Factors (✓)**: exact wallet match (`bc1qxy...`), exact PGP fingerprint (`9B2A 78C1...`), alias similarity, and platform overlap.
   - Show **ML Classifier Probability**: 99.8% (Logistic Regression).
4. **Inspect Topological Network Graph**:
   - Navigate to **Relationship Graph**.
   - See how `ACT-001` and `ACT-002` cluster around the same green wallet node and purple PGP node.
   - Click on nodes to display entity properties in the side inspector.
5. **Verify Dynamic Database Management**:
   - Go to **Data Management**.
   - Click **Add Synthetic Actor** (or Edit). Add a new synthetic record or edit an alias.
   - Notice that the change immediately persists in the database, updates the dashboard, and recalculates correlation scores without touching frontend code.
6. **Generate Formal Dossier**:
   - Go to **Case Report**.
   - Click **Print / Export PDF** to display the intelligence case file with signature blocks and academic disclaimers.

---

## 5. Directory Structure

```
prototype/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & lifespan seed loader
│   │   ├── config.py                # Environment configurations
│   │   ├── database.py              # MongoDB + Local JSON resilient DB layer
│   │   ├── schemas/models.py        # Pydantic schemas
│   │   ├── matching/
│   │   │   ├── engine.py            # Explainable multi-factor scoring algorithm
│   │   │   ├── ml_model.py          # Scikit-learn correlation classifier
│   │   │   └── graph_analytics.py   # NetworkX graph generator
│   │   └── routes/                  # actors, footprints, relationships, match, graph, report
│   ├── seed/
│   │   └── synthetic_data.py        # 25+ synthetic actors with intentional overlaps
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ActorDatabase.jsx
│   │   │   ├── IdentityComparison.jsx
│   │   │   ├── RelationshipGraph.jsx
│   │   │   ├── DataManagement.jsx
│   │   │   └── InvestigationReport.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture.md
│   └── api.md
├── docker-compose.yml
└── README.md
```

---

## 6. Limitations & Future Scope
- **Current Limitations**: Operates exclusively on mock/simulated datasets to ensure zero legal/ethical violations.
- **Future Scope**: Integration with real STIX/TAXII threat intel feeds, blockchain tracing graph layouts, and automated clustering via unsupervised HDBSCAN.
