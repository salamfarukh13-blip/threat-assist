from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.database import db_manager
from backend.app.schemas.models import ActorBase, ActorCreate, ActorUpdate

router = APIRouter(prefix="/api/actors", tags=["actors"])

@router.get("")
async def get_actors(search: Optional[str] = None, risk: Optional[str] = None):
    coll = db_manager.get_collection("actors")
    actors = await coll.find()
    if search:
        s = search.lower()
        actors = [
            a for a in actors
            if s in a.get("primary_alias", "").lower()
            or s in a.get("actor_id", "").lower()
            or any(s in x.lower() for x in a.get("aliases", []))
            or any(s in x.lower() for x in a.get("wallets", []))
            or any(s in x.lower() for x in a.get("pgp_fingerprints", []))
            or any(s in x.lower() for x in a.get("emails", []))
            or any(s in x.lower() for x in a.get("domains", []))
        ]
    if risk and risk != "all":
        actors = [a for a in actors if a.get("risk_level", "").lower() == risk.lower()]
    return actors

@router.get("/{actor_id}")
async def get_actor(actor_id: str):
    coll = db_manager.get_collection("actors")
    actor = await coll.find_one({"actor_id": actor_id})
    if not actor:
        raise HTTPException(status_code=404, detail=f"Actor {actor_id} not found")
    return actor

@router.post("", status_code=201)
async def create_actor(actor_data: ActorCreate):
    coll = db_manager.get_collection("actors")
    existing = await coll.find_one({"actor_id": actor_data.actor_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Actor ID {actor_data.actor_id} already exists")
    doc = actor_data.model_dump()
    await coll.insert_one(doc)
    return doc

@router.put("/{actor_id}")
async def update_actor(actor_id: str, actor_update: ActorUpdate):
    coll = db_manager.get_collection("actors")
    existing = await coll.find_one({"actor_id": actor_id})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Actor {actor_id} not found")
    update_data = {k: v for k, v in actor_update.model_dump().items() if v is not None}
    await coll.update_one({"actor_id": actor_id}, update_data)
    updated = await coll.find_one({"actor_id": actor_id})
    return updated

@router.delete("/{actor_id}")
async def delete_actor(actor_id: str):
    coll = db_manager.get_collection("actors")
    existing = await coll.find_one({"actor_id": actor_id})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Actor {actor_id} not found")
    await coll.delete_one({"actor_id": actor_id})
    return {"message": f"Actor {actor_id} deleted successfully"}
