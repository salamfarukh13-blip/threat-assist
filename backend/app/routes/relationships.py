from fastapi import APIRouter, HTTPException
from backend.app.database import db_manager
from backend.app.schemas.models import RelationshipCreate

router = APIRouter(prefix="/api/relationships", tags=["relationships"])

@router.get("")
async def get_relationships():
    coll = db_manager.get_collection("relationships")
    return await coll.find()

@router.post("", status_code=201)
async def create_relationship(rel_data: RelationshipCreate):
    coll = db_manager.get_collection("relationships")
    doc = rel_data.model_dump()
    if not doc.get("rel_id"):
        count = await coll.count_documents({})
        doc["rel_id"] = f"REL-{count + 1:04d}"
    await coll.insert_one(doc)
    return doc

@router.delete("/{rel_id}")
async def delete_relationship(rel_id: str):
    coll = db_manager.get_collection("relationships")
    deleted = await coll.delete_one({"rel_id": rel_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"message": "Relationship deleted successfully"}
