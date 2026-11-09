import json
import os

def _parse_origins(raw: str) -> list:
    raw = (raw or "").strip()
    try:
        value = json.loads(raw)
        if isinstance(value, list):
            return [str(v).strip() for v in value if str(v).strip()]
    except ValueError:
        pass
    return [o.strip() for o in raw.split(",") if o.strip()] or ["*"]


class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "threat_assist")
    # JSON list ("[\"https://my-app.vercel.app\"]") or comma-separated list; defaults to all origins.
    CORS_ORIGINS: list = _parse_origins(os.getenv("CORS_ORIGINS", '["*"]'))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

settings = Settings()
