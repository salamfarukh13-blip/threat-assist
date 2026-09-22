import os
import json
import logging
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime
from backend.app.config import settings

logger = logging.getLogger("threat_assist.db")

class MongoCollectionWrapper:
    """Unified wrapper around Motor AsyncIOMotorCollection for consistent async methods."""
    def __init__(self, raw_collection):
        self.raw = raw_collection

    async def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        cursor = self.raw.find(query or {})
        docs = await cursor.to_list(length=2000)
        for d in docs:
            if "_id" in d:
                d["_id"] = str(d["_id"])
        return docs

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.raw.find_one(query)
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

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
                self.collections[name] = MongoCollectionWrapper(self.mongo_db[name])
            return self.collections[name]
        if name not in self.collections:
            self.collections[name] = LocalJSONCollection(name, self)
        return self.collections[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager
