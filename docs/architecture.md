# THREAT ASSIST — System Architecture & Design

## Academic Prototype Overview (SIH 2026)
**THREAT ASSIST** is a digital identity correlation and threat intelligence platform designed to help investigators de-anonymize synthetic threat-actor footprints across darknet forums, marketplaces, and messaging channels.

> **CRITICAL ETHICAL NOTICE:** This system operates strictly on **synthetic / mock demonstration data** generated locally. It does not perform illegal surveillance or connect to live dark-web networks.

---

## High-Level Architecture

```
+-----------------------------------------------------------+
|               REACT + VITE FRONTEND (DARK UI)             |
|   Dashboard | Actor DB | Correlation Engine | Graph | CRUD |
+-----------------------------+-----------------------------+
                              |
                     REST APIs (HTTP / JSON)
                              |
+-----------------------------v-----------------------------+
|                     FASTAPI BACKEND                       |
|   /api/actors | /api/compare | /api/graph | /api/report   |
+--------------+------------------------------+-------------+
               |                              |
               v                              v
+-------------------------------+ +-------------------------+
|     IDENTITY MATCHING ENGINE   | |     DATABASE LAYER      |
|  - RapidFuzz (String distance) | |  - MongoDB (Primary)    |
|  - Exact Cryptographic Matches | |  - Local JSON Fallback  |
|  - Scikit-Learn ML Classifier | |    (Offline Resilient)  |
|  - NetworkX Graph Analytics   | +-------------------------+
+-------------------------------+
```

---

## Matching & Correlation Scoring Methodology

### Heuristic Weights Breakdown
- **Alias Similarity (25%)**: RapidFuzz token sort ratio & token set matching.
- **Email Pattern / Domain (15%)**: Levenshtein comparison of usernames and domain names.
- **PGP Public Key Fingerprint (20%)**: Normalized exact match comparison.
- **Cryptocurrency Wallet Address (20%)**: Exact match on BTC, ETH, XMR, USDT deposit addresses.
- **Onion Infrastructure / Domain (10%)**: Shared hidden services, subdomains, and escrow portals.
- **Platform Overlap (5%)**: Jaccard similarity of darknet forums and channels.
- **Temporal Activity Overlap (5%)**: Activity timeline concurrence.

### Scoring Bands
- **80 – 100%**: Strong Correlation (`confirmed_match_candidate`)
- **60 – 79%**: Possible Correlation (`possible_match`)
- **30 – 59%**: Weak Connection (`weak_connection`)
- **0 – 29%**: Low Correlation / Disjoint (`no_meaningful_connection`)

---

## Machine Learning Integration
A calibrated `LogisticRegression` model trained on synthetic feature vectors runs in parallel with the rule-based engine. The combined score balances heuristic explainability (60%) with statistical feature weighting (40%).
