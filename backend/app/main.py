import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.database import db_manager
from backend.seed.synthetic_data import SYNTHETIC_ACTORS, generate_footprints_and_relationships
from backend.app.matching.graph_analytics import graph_analytics
from backend.app.routes import actors, footprints, relationships, matching, graph, dashboard, report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("threat_assist")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing THREAT ASSIST Backend...")
    await db_manager.connect()

    # Seed synthetic data if collections are empty
    actor_coll = db_manager.get_collection("actors")
    existing_actors = await actor_coll.count_documents({})
    if existing_actors == 0:
        logger.info("Database empty. Seeding 25+ synthetic threat actors and relationships...")
        footprints_data, rels_data = generate_footprints_and_relationships(SYNTHETIC_ACTORS)
        
        for actor in SYNTHETIC_ACTORS:
            await actor_coll.insert_one(actor)

        fp_coll = db_manager.get_collection("digital_footprints")
        for fp in footprints_data:
            await fp_coll.insert_one(fp)

        rel_coll = db_manager.get_collection("relationships")
        for rel in rels_data:
            await rel_coll.insert_one(rel)

        logger.info(f"Seeded {len(SYNTHETIC_ACTORS)} actors, {len(footprints_data)} footprints, {len(rels_data)} relationships.")

    # Prime graph analytics
    all_actors = await actor_coll.find()
    rel_coll = db_manager.get_collection("relationships")
    all_rels = await rel_coll.find()
    graph_analytics.build_graph(all_actors, all_rels)
    logger.info(f"Graph primed with {graph_analytics.graph.number_of_nodes()} nodes and {graph_analytics.graph.number_of_edges()} edges.")

    yield
    logger.info("Shutting down THREAT ASSIST Backend.")

app = FastAPI(
    title="THREAT ASSIST API",
    description="Dark Web Threat Actor De-anonymization & Identity Correlation System (Academic SIH Prototype)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(actors.router)
app.include_router(footprints.router)
app.include_router(relationships.router)
app.include_router(matching.router)
app.include_router(graph.router)
app.include_router(report.router)

@app.get("/")
async def root():
    return {
        "system": "THREAT ASSIST",
        "description": "Digital Identity Correlation & Threat Intelligence Assistant",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
