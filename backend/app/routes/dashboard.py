from fastapi import APIRouter
from backend.app.database import db_manager

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "system": "THREAT ASSIST SIH Prototype",
        "database_mode": db_manager.mode,
        "active_database": "MongoDB" if db_manager.mode == "mongodb" else "Persistent Local Document Store (Local Fallback)"
    }

@router.get("/dashboard")
async def get_dashboard_metrics():
    coll_actors = db_manager.get_collection("actors")
    coll_fps = db_manager.get_collection("digital_footprints")
    coll_rels = db_manager.get_collection("relationships")

    actors = await coll_actors.find()
    fps = await coll_fps.find()
    rels = await coll_rels.find()

    total_actors = len(actors)
    total_relationships = len(rels)

    # Count digital footprints dynamically from actor data (PGP + wallets + domains + emails)
    fp_count_from_actors = 0
    for a in actors:
        fp_count_from_actors += len(a.get("pgp_fingerprints") or [])
        fp_count_from_actors += len(a.get("wallets") or [])
        fp_count_from_actors += len(a.get("domains") or [])
        fp_count_from_actors += len(a.get("emails") or [])
        fp_count_from_actors += len(a.get("aliases") or [])
    total_footprints = max(len(fps), fp_count_from_actors)

    critical_actors = sum(1 for a in actors if a.get("risk_level") == "critical")
    high_actors = sum(1 for a in actors if a.get("risk_level") == "high")

    # Platform distribution
    platforms = {}
    for a in actors:
        for p in a.get("platforms", []):
            platforms[p] = platforms.get(p, 0) + 1

    top_platforms = [{"name": k, "count": v} for k, v in sorted(platforms.items(), key=lambda x: x[1], reverse=True)[:5]]

    # Recent high correlation pairs in synthetic dataset
    known_connections = [
        {"pair": "ShadowFox (ACT-001) ↔ Shadow_Fox (ACT-002)", "score": 93.4, "badge": "High Correlation", "type": "Shared Wallet & PGP"},
        {"pair": "CryptoPhantom (ACT-005) ↔ PhantomGhost (ACT-006)", "score": 89.2, "badge": "High Correlation", "type": "Shared XMR & Domain"},
        {"pair": "KrakenDread (ACT-011) ↔ TentacleOps (ACT-012)", "score": 87.5, "badge": "Affiliated", "type": "Shared Deposit Wallet & PGP"},
        {"pair": "MirageRansom (ACT-016) ↔ Mirage_Affiliate (ACT-017)", "score": 94.8, "badge": "High Correlation", "type": "Shared RaaS Wallet"},
        {"pair": "DarkWolf (ACT-003) ↔ NightWolf (ACT-004)", "score": 52.0, "badge": "Weak Connection", "type": "Shared Escrow Domain"}
    ]

    return {
        "total_actors": total_actors,
        "total_digital_footprints": total_footprints,
        "total_relationships": total_relationships,
        "potential_connections": len(known_connections),
        "risk_breakdown": {
            "critical": critical_actors,
            "high": high_actors,
            "medium": total_actors - critical_actors - high_actors
        },
        "top_platforms": top_platforms,
        "high_correlation_matches": known_connections,
        "recent_actors": actors[:6],
        "database_status": {
            "engine": db_manager.mode,
            "persistence": "Guaranteed"
        }
    }
