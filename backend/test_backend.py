import sys
import os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from backend.app.main import app, lifespan
from backend.app.database import db_manager

async def main():
    print("Testing lifespan startup...")
    async with lifespan(app):
        print(f"Database mode: {db_manager.mode}")
        actors_coll = db_manager.get_collection("actors")
        count = await actors_coll.count_documents()
        print(f"Actor count in database: {count}")
        
        # Test finding ACT-001
        act1 = await actors_coll.find_one({"actor_id": "ACT-001"})
        print(f"ACT-001 primary alias: {act1.get('primary_alias') if act1 else 'None'}")
        
        # Test comparison
        from backend.app.matching.engine import engine
        from backend.app.matching.ml_model import ml_model
        act2 = await actors_coll.find_one({"actor_id": "ACT-002"})
        rule_cmp = engine.compare(act1, act2)
        features = engine.extract_features(act1, act2)
        ml_cmp = ml_model.predict_probability(features)
        print(f"Comparison ShadowFox vs Shadow_Fox:")
        print(f" - Rule score: {rule_cmp['correlation_score']}% ({rule_cmp['category']})")
        print(f" - ML probability: {ml_cmp['ml_probability']}%")
        print(f" - Supporting factors: {rule_cmp['supporting_factors']}")
        print("Backend verified successfully!")

if __name__ == "__main__":
    asyncio.run(main())
