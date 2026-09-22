from fastapi import APIRouter, Query
from typing import Optional
from backend.app.database import db_manager
from backend.app.matching.graph_analytics import graph_analytics

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("")
async def get_graph_data(actor_id: Optional[str] = None):
    coll_actors = db_manager.get_collection("actors")
    coll_rels = db_manager.get_collection("relationships")

    actors = await coll_actors.find()
    relationships = await coll_rels.find()

    graph_analytics.build_graph(actors, relationships)
    return graph_analytics.to_cytoscape_elements(filter_actor=actor_id)

@router.get("/path")
async def get_path(source: str, target: str):
    coll_actors = db_manager.get_collection("actors")
    coll_rels = db_manager.get_collection("relationships")
    actors = await coll_actors.find()
    relationships = await coll_rels.find()
    graph_analytics.build_graph(actors, relationships)
    
    path = graph_analytics.find_path_between_actors(source, target)
    return {"source": source, "target": target, "path": path}
