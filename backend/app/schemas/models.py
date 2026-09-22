from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ActorBase(BaseModel):
    actor_id: str
    primary_alias: str
    aliases: List[str] = []
    emails: List[str] = []
    pgp_fingerprints: List[str] = []
    wallets: List[str] = []
    domains: List[str] = []
    platforms: List[str] = []
    language: str = "English"
    timezone: str = "UTC+00:00"
    first_seen: str = "2025-01-01"
    last_seen: str = "2026-03-01"
    risk_level: str = "medium"  # low, medium, high, critical
    notes: str = "Synthetic demonstration record"

class ActorCreate(ActorBase):
    pass

class ActorUpdate(BaseModel):
    primary_alias: Optional[str] = None
    aliases: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    pgp_fingerprints: Optional[List[str]] = None
    wallets: Optional[List[str]] = None
    domains: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    risk_level: Optional[str] = None
    notes: Optional[str] = None

class DigitalFootprintBase(BaseModel):
    footprint_id: Optional[str] = None
    type: str  # alias, email, pgp, wallet, domain, platform
    value: str
    associated_actors: List[str] = []
    platform: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Dict[str, Any] = {}

class DigitalFootprintCreate(DigitalFootprintBase):
    pass

class RelationshipBase(BaseModel):
    rel_id: Optional[str] = None
    source: str
    target: str
    relationship: str  # USES_WALLET, USES_PGP, USES_ALIAS, OPERATES_DOMAIN, ACTIVE_ON, CORRELATED_WITH
    confidence: float = 1.0
    evidence: str = "Observed in synthetic records"

class RelationshipCreate(RelationshipBase):
    pass

class CompareRequest(BaseModel):
    actor_id_a: str
    actor_id_b: str
    weights: Optional[Dict[str, float]] = None

class QuickMatchRequest(BaseModel):
    query: str
    type: Optional[str] = "all"  # alias, wallet, pgp, email, domain

class ReportRequest(BaseModel):
    case_id: str
    actor_id_a: str
    actor_id_b: Optional[str] = None
    investigator_name: str = "Lead Investigator"
    analyst_notes: Optional[str] = None
