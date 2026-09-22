from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from backend.app.database import db_manager
from backend.app.schemas.models import CompareRequest, QuickMatchRequest
from backend.app.matching.engine import IdentityMatchingEngine, DEFAULT_WEIGHTS
from backend.app.matching.ml_model import ml_model
from backend.app.matching.graph_analytics import graph_analytics

router = APIRouter(prefix="/api", tags=["matching"])

@router.post("/compare")
async def compare_identities(req: CompareRequest):
    coll = db_manager.get_collection("actors")
    actor_a = await coll.find_one({"actor_id": req.actor_id_a})
    actor_b = await coll.find_one({"actor_id": req.actor_id_b})

    if not actor_a:
        raise HTTPException(status_code=404, detail=f"Actor A ({req.actor_id_a}) not found")
    if not actor_b:
        raise HTTPException(status_code=404, detail=f"Actor B ({req.actor_id_b}) not found")

    # Rule-based Engine
    weights = req.weights or DEFAULT_WEIGHTS
    custom_engine = IdentityMatchingEngine(weights=weights)
    rule_results = custom_engine.compare(actor_a, actor_b)

    # ML Component
    features = custom_engine.extract_features(actor_a, actor_b)
    ml_results = ml_model.predict_probability(features)

    # Combined Correlation Score (60% Rule-Based, 40% ML)
    rule_score = rule_results["correlation_score"]
    ml_score = ml_results["ml_probability"]
    combined_score = round(0.60 * rule_score + 0.40 * ml_score, 1)

    # Shortest connection path in graph
    shortest_path = graph_analytics.find_path_between_actors(req.actor_id_a, req.actor_id_b)

    return {
        "actor_a": actor_a,
        "actor_b": actor_b,
        "combined_score": combined_score,
        "rule_based": rule_results,
        "ml_model": ml_results,
        "graph_path": shortest_path,
        "features_extracted": features,
        "status": "success"
    }

@router.post("/match")
async def find_matches_for_identifier(req: QuickMatchRequest):
    """Search for actors matching a specific identifier and score all candidates."""
    coll = db_manager.get_collection("actors")
    actors = await coll.find()
    
    query = req.query.strip().lower()
    if not query:
        return []

    results = []
    engine = IdentityMatchingEngine()

    # Synthetic dummy query object
    query_actor = {
        "actor_id": "QUERY_INPUT",
        "primary_alias": req.query,
        "aliases": [req.query],
        "emails": [req.query] if "@" in req.query else [],
        "wallets": [req.query] if (req.query.startswith("bc1") or req.query.startswith("0x") or len(req.query) > 26) else [],
        "pgp_fingerprints": [req.query] if (" " in req.query or len(req.query) == 16 or len(req.query) == 40) else [],
        "domains": [req.query] if (".onion" in req.query or "." in req.query) else [],
        "platforms": [],
        "first_seen": "2025-01-01",
        "last_seen": "2026-03-01"
    }

    for actor in actors:
        cmp = engine.compare(query_actor, actor)
        score = cmp["correlation_score"]
        if score > 15:
            results.append({
                "actor_id": actor["actor_id"],
                "primary_alias": actor["primary_alias"],
                "risk_level": actor.get("risk_level", "medium"),
                "correlation_score": score,
                "category": cmp["category"],
                "supporting_factors": cmp["supporting_factors"],
                "actor": actor
            })

    results.sort(key=lambda x: x["correlation_score"], reverse=True)
    return results[:10]
