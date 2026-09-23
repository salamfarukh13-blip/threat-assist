import os
import json
import logging
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime
from backend.app.config import settings

logger = logging.getLogger("threat_assist.db")


def normalize_actor(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize any actor document to the standard app schema.
    Handles both the synthetic schema (actor_id, primary_alias …) and
    any externally-imported schema (Actor_ID, Primary_Handle …).
    """
    if "actor_id" in doc:
        # Already correct schema — just ensure required list fields exist
        doc.setdefault("aliases", [])
        doc.setdefault("emails", [])
        doc.setdefault("pgp_fingerprints", [])
        doc.setdefault("wallets", [])
        doc.setdefault("domains", [])
        doc.setdefault("platforms", [])
        return doc

    # --- Map foreign schema fields to standard schema ---
    actor_id = doc.get("Actor_ID") or doc.get("actor_id") or str(doc.get("_id", "UNKNOWN"))
    primary_alias = (
        doc.get("Primary_Handle")
        or doc.get("primary_alias")
        or doc.get("Handle")
        or actor_id
    )

    # Derive risk_level from Attribution_Confidence or Category
    confidence = doc.get("Attribution_Confidence", 0.5)
    category = (doc.get("Category") or "").lower()
    if isinstance(confidence, (int, float)) and confidence >= 0.85:
        risk_level = "critical"
    elif isinstance(confidence, (int, float)) and confidence >= 0.70:
        risk_level = "high"
    elif any(k in category for k in ["ransomware", "apt", "critical"]):
        risk_level = "critical"
    elif any(k in category for k in ["fraud", "malware", "high"]):
        risk_level = "high"
    else:
        risk_level = "medium"

    # Date normalization helper
    def fmt_date(val):
        if isinstance(val, datetime):
            return val.strftime("%Y-%m-%d")
        if isinstance(val, str) and val:
            return val[:10]
        return "2025-01-01"

    normalized = {
        "_id": doc.get("_id", ""),
        "actor_id": actor_id,
        "primary_alias": primary_alias,
        "aliases": doc.get("aliases") or ([primary_alias] if primary_alias else []),
        "emails": doc.get("emails") or [],
        "pgp_fingerprints": doc.get("pgp_fingerprints") or [],
        "wallets": doc.get("wallets") or [],
        "domains": doc.get("domains") or [],
        "platforms": doc.get("platforms") or [],
        "language": doc.get("language") or doc.get("Language") or "Unknown",
        "timezone": doc.get("timezone") or doc.get("Timezone") or "UTC+00:00",
        "first_seen": fmt_date(doc.get("First_Observed") or doc.get("first_seen")),
        "last_seen": fmt_date(doc.get("Last_Scan_Date") or doc.get("last_seen")),
        "risk_level": risk_level,
        "notes": (
            doc.get("notes")
            or f"{doc.get('Category', 'Threat Actor')} | Source: {doc.get('Source', 'Imported')} | "
               f"Posts: {doc.get('Post_Count', 0)} | PGP keys: {doc.get('PGP_Count', 0)} | "
               f"Wallets: {doc.get('Wallet_Count', 0)}"
        ),
    }
    return normalized

class MongoCollectionWrapper:
    """Unified wrapper around Motor AsyncIOMotorCollection for consistent async methods."""
    def __init__(self, raw_collection, collection_name: str = ""):
        self.raw = raw_collection
        self.collection_name = collection_name

    def _normalize(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        if self.collection_name == "actors":
            return normalize_actor(doc)
        return doc

    async def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        cursor = self.raw.find(query or {})
        docs = await cursor.to_list(length=2000)
        result = []
        for d in docs:
            if "_id" in d:
                d["_id"] = str(d["_id"])
            result.append(self._normalize(d))
        return result

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Try standard query first
        doc = await self.raw.find_one(query)
        if doc is None and self.collection_name == "actors" and "actor_id" in query:
            # Also search foreign-schema actors by Actor_ID
            doc = await self.raw.find_one({"Actor_ID": query["actor_id"]})
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        if doc:
            return self._normalize(doc)
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" in doc_copy and isinstance(doc_copy["_id"], str) and not doc_copy["_id"].isalnum():
            del doc_copy["_id"]
        res = await self.raw.insert_one(doc_copy)
        doc["_id"] = str(res.inserted_id)
        return doc

    async def update_one(self, query: Dict[str, Any], update_doc: Dict[str, Any]) -> bool:
        update_op = update_doc if any(k.startswith("$") for k in update_doc) else {"$set": update_doc}
        res = await self.raw.update_one(query, update_op)
        return res.modified_count > 0

    async def delete_one(self, query: Dict[str, Any]) -> bool:
        res = await self.raw.delete_one(query)
        return res.deleted_count > 0

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return await self.raw.count_documents(query or {})

    async def drop(self):
        await self.raw.drop()


class LocalJSONCollection:
    """Persistent local JSON document collection when MongoDB is offline."""
    def __init__(self, name: str, parent_db):
        self.name = name
        self.parent = parent_db

    def _get_items(self) -> List[Dict[str, Any]]:
        return self.parent.data.get(self.name, [])

    async def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        items = self._get_items()
        if not query:
            return [dict(x) for x in items]
        result = []
        for item in items:
            match = True
            for k, v in query.items():
                if k == "$or":
                    or_match = False
                    for cond in v:
                        for sub_k, sub_v in cond.items():
                            val = item.get(sub_k)
                            if isinstance(val, list):
                                if sub_v in val:
                                    or_match = True
                            elif val == sub_v:
                                or_match = True
                    if not or_match:
                        match = False
                        break
                elif isinstance(item.get(k), list):
                    if v not in item.get(k):
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                result.append(dict(item))
        return result

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        res = await self.find(query)
        return res[0] if res else None

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(len(self._get_items()) + 1)
        self._get_items().append(doc_copy)
        self.parent.save()
        return doc_copy

    async def update_one(self, query: Dict[str, Any], update_doc: Dict[str, Any]):
        items = self._get_items()
        set_fields = update_doc.get("$set", update_doc)
        for i, item in enumerate(items):
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                items[i].update(set_fields)
                self.parent.save()
                return True
        return False

    async def delete_one(self, query: Dict[str, Any]) -> bool:
        items = self._get_items()
        for i, item in enumerate(items):
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                items.pop(i)
                self.parent.save()
                return True
        return False

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        res = await self.find(query)
        return len(res)

    async def drop(self):
        self.parent.data[self.name] = []
        self.parent.save()


class DatabaseManager:
    def __init__(self):
        self.mode = "init"
        self.client = None
        self.mongo_db = None
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.data_file = os.path.join(self.data_dir, "threat_assist_db.json")
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "actors": [],
            "digital_footprints": [],
            "relationships": []
        }
        self.collections: Dict[str, Any] = {}

    def load_local(self):
        os.makedirs(self.data_dir, exist_ok=True)
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception as e:
                logger.error(f"Error reading local db: {e}")
        else:
            self.save()

    def save(self):
        os.makedirs(self.data_dir, exist_ok=True)
        try:
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving local db: {e}")

    async def connect(self):
        self.load_local()
        import socket
        from urllib.parse import urlparse
        
        parsed = urlparse(settings.MONGODB_URI)
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or 27017
        
        is_port_open = False
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.4)
            result = sock.connect_ex((host, port))
            if result == 0:
                is_port_open = True
            sock.close()
        except Exception:
            is_port_open = False

        if is_port_open:
            try:
                from motor.motor_asyncio import AsyncIOMotorClient
                client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
                await client.admin.command('ping')
                self.client = client
                self.mongo_db = client[settings.DATABASE_NAME]
                self.mode = "mongodb"
                logger.info(f"Connected successfully to MongoDB ({settings.DATABASE_NAME}).")
                return
            except Exception as e:
                logger.warning(f"MongoDB connection failed: {e}")

        self.mode = "local_json"
        logger.info(f"MongoDB offline. Seamlessly using persistent local document store: {self.data_file}")

    def get_collection(self, name: str):
        if self.mode == "mongodb" and self.mongo_db is not None:
            if name not in self.collections:
                self.collections[name] = MongoCollectionWrapper(self.mongo_db[name], collection_name=name)
            return self.collections[name]
        if name not in self.collections:
            self.collections[name] = LocalJSONCollection(name, self)
        return self.collections[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager
