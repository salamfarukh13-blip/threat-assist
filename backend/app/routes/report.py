from fastapi import APIRouter, HTTPException
from datetime import datetime
from backend.app.database import db_manager
from backend.app.schemas.models import ReportRequest
from backend.app.matching.engine import IdentityMatchingEngine
from backend.app.matching.ml_model import ml_model
from backend.app.matching.graph_analytics import graph_analytics

router = APIRouter(prefix="/api/report", tags=["report"])

@router.post("")
async def generate_investigation_report(req: ReportRequest):
    coll = db_manager.get_collection("actors")
    actor_a = await coll.find_one({"actor_id": req.actor_id_a})
    if not actor_a:
        raise HTTPException(status_code=404, detail="Actor A not found")

    actor_b = None
    comparison_data = None
    if req.actor_id_b:
        actor_b = await coll.find_one({"actor_id": req.actor_id_b})
        if actor_b:
            engine = IdentityMatchingEngine()
            rule_res = engine.compare(actor_a, actor_b)
            features = engine.extract_features(actor_a, actor_b)
            ml_res = ml_model.predict_probability(features)
            path = graph_analytics.find_path_between_actors(req.actor_id_a, req.actor_id_b)
            combined_score = round(0.6 * rule_res["correlation_score"] + 0.4 * ml_res["ml_probability"], 1)
            
            comparison_data = {
                "rule_based": rule_res,
                "ml_model": ml_res,
                "combined_score": combined_score,
                "graph_path": path
            }

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    report = {
        "case_id": req.case_id,
        "generated_at": timestamp,
        "investigator": req.investigator_name,
        "disclaimer": "CRITICAL NOTICE: Generated from 100% SYNTHETIC DEMONSTRATION DATA for academic Smart India Hackathon (SIH) prototype evaluation. No real identities or live dark web surveillance involved.",
        "primary_target": actor_a,
        "secondary_target": actor_b,
        "comparison_data": comparison_data,
        "analyst_notes": req.analyst_notes or "Identity correlation indicates strong convergence of cryptographic and infrastructure indicators. Recommend monitoring synthetic escrow endpoints."
    }

    return report
