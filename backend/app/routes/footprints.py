from fastapi import APIRouter, HTTPException
from typing import Optional
from backend.app.database import db_manager
from backend.app.schemas.models import DigitalFootprintCreate

router = APIRouter(prefix="/api/footprints", tags=["footprints"])

@router.get("")
async def get_footprints(type: Optional[str] = None, search: Optional[str] = None):
    coll = db_manager.get_collection("digital_footprints")
    fps = await coll.find()
    if type and type != "all":
        fps = [f for f in fps if f.get("type") == type]
    if search:
        s = search.lower()
        fps = [f for f in fps if s in f.get("value", "").lower() or any(s in a.lower() for a in f.get("associated_actors", []))]
    return fps

@router.post("", status_code=201)
async def create_footprint(fp_data: DigitalFootprintCreate):
    coll = db_manager.get_collection("digital_footprints")
    doc = fp_data.model_dump()
    if not doc.get("footprint_id"):
        count = await coll.count_documents({})
        doc["footprint_id"] = f"FP-{count + 1:04d}"
    await coll.insert_one(doc)
    return doc

@router.delete("/{footprint_id}")
async def delete_footprint(footprint_id: str):
    coll = db_manager.get_collection("digital_footprints")
    deleted = await coll.delete_one({"footprint_id": footprint_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Footprint not found")
    return {"message": "Footprint deleted successfully"}
