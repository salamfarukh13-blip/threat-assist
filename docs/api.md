# THREAT ASSIST — REST API Documentation

Base URL: `http://localhost:8000/api`

## Endpoints

### 1. System & Dashboard
- `GET /api/health`
  - Returns backend health and active database mode (MongoDB vs Persistent Local JSON Store).
- `GET /api/dashboard`
  - Returns aggregate stats, platform metrics, and known synthetic overlap clusters.

### 2. Threat Actors
- `GET /api/actors?search={query}&risk={level}`
  - List actors with optional text search and risk level filter (`critical`, `high`, `medium`, `low`).
- `GET /api/actors/{id}`
  - Retrieve single actor profile by ID (e.g. `ACT-001`).
- `POST /api/actors`
  - Create new synthetic threat actor.
- `PUT /api/actors/{id}`
  - Update actor profile.
- `DELETE /api/actors/{id}`
  - Remove actor record.

### 3. Digital Footprints
- `GET /api/footprints?type={type}&search={query}`
  - List digital footprints (alias, wallet, pgp, email, domain, platform).
- `POST /api/footprints`
  - Register new digital footprint.
- `DELETE /api/footprints/{id}`
  - Remove digital footprint.

### 4. Graph & Relationships
- `GET /api/relationships`
  - List all cross-entity edges.
- `POST /api/relationships`
  - Create relationship edge between entities.
- `DELETE /api/relationships/{id}`
  - Unlink relationship edge.
- `GET /api/graph?actor_id={id}`
  - Returns nodes and edges formatted for Cytoscape.js / React Flow graph rendering.
- `GET /api/graph/path?source={id}&target={id}`
  - Returns shortest topological path between two entities using NetworkX.

### 5. Identity Correlation & ML Matching
- `POST /api/compare`
  - Body: `{ "actor_id_a": "ACT-001", "actor_id_b": "ACT-002", "weights": {...} }`
  - Returns rule-based score, supporting factors (✓), counter-evidence (✗), ML probability, feature weights, and shortest path.
- `POST /api/match`
  - Body: `{ "query": "ShadowFox" }`
  - Correlates arbitrary query string across all actors and ranks top candidate matches.

### 6. Investigation Dossier
- `POST /api/report`
  - Body: `{ "case_id": "...", "actor_id_a": "ACT-001", "actor_id_b": "ACT-002", "investigator_name": "...", "analyst_notes": "..." }`
  - Generates comprehensive de-anonymization intelligence dossier.
