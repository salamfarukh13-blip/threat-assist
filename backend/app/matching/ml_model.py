import logging
import numpy as np
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

logger = logging.getLogger("threat_assist.ml")

FEATURE_NAMES = [
    "alias_similarity",
    "email_similarity",
    "pgp_match",
    "wallet_match",
    "domain_relationship",
    "platform_overlap",
    "temporal_overlap"
]

class IdentityCorrelationMLModel:
    def __init__(self):
        self.model = LogisticRegression(random_state=42)
        self.is_trained = False

    def _generate_synthetic_training_data(self):
        """Generates realistic synthetic feature vectors representing matching vs non-matching pairs."""
        np.random.seed(42)
        X = []
        y = []

        # Positive class (Same Threat Actor: High wallet/pgp match or high alias + platform)
        for _ in range(150):
            alias = np.random.uniform(0.65, 1.0)
            email = np.random.choice([0.0, 0.7, 1.0], p=[0.2, 0.4, 0.4])
            pgp = np.random.choice([0.0, 1.0], p=[0.25, 0.75])
            wallet = np.random.choice([0.0, 1.0], p=[0.2, 0.8])
            domain = np.random.choice([0.0, 0.7, 1.0], p=[0.3, 0.3, 0.4])
            platform = np.random.uniform(0.5, 1.0)
            temporal = np.random.uniform(0.7, 1.0)
            X.append([alias, email, pgp, wallet, domain, platform, temporal])
            y.append(1)

        # Negative class (Disjoint or distinct threat actors)
        for _ in range(250):
            alias = np.random.uniform(0.0, 0.45)
            email = np.random.choice([0.0, 0.2], p=[0.85, 0.15])
            pgp = 0.0
            wallet = 0.0
            domain = np.random.choice([0.0, 0.2], p=[0.9, 0.1])
            platform = np.random.uniform(0.0, 0.4)
            temporal = np.random.uniform(0.0, 0.8)
            X.append([alias, email, pgp, wallet, domain, platform, temporal])
            y.append(0)

        # Borderline cases
        for _ in range(80):
            alias = np.random.uniform(0.3, 0.6)
            email = 0.0
            pgp = 0.0
            wallet = 0.0
            domain = np.random.choice([0.0, 0.5], p=[0.7, 0.3])
            platform = np.random.uniform(0.2, 0.5)
            temporal = np.random.uniform(0.4, 0.8)
            X.append([alias, email, pgp, wallet, domain, platform, temporal])
            y.append(0)

        return np.array(X), np.array(y)

    def _ensure_trained(self):
        if self.is_trained:
            return
        try:
            X, y = self._generate_synthetic_training_data()
            self.model.fit(X, y)
            self.is_trained = True
            logger.info("Trained synthetic Identity Correlation ML Model successfully.")
        except Exception as e:
            logger.error(f"Failed to train ML model: {e}")

    def predict_probability(self, features: Dict[str, float]) -> Dict[str, Any]:
        self._ensure_trained()
        if not self.is_trained:
            return {"ml_probability": 0.0, "confidence": "Low", "model": "LogisticRegression"}

        feature_vector = np.array([[features.get(k, 0.0) for k in FEATURE_NAMES]])
        probs = self.model.predict_proba(feature_vector)[0]
        match_prob = round(float(probs[1]) * 100.0, 1)

        coefs = self.model.coef_[0]
        norm_weights = {
            FEATURE_NAMES[i]: round(float(max(0.0, coefs[i])), 3)
            for i in range(len(FEATURE_NAMES))
        }

        return {
            "ml_probability": match_prob,
            "prediction": "Positive (High Probability Match)" if match_prob >= 60 else "Negative (Distinct Identities)",
            "model_type": "Logistic Regression (Calibrated Synthetic Ground Truth)",
            "feature_weights": norm_weights,
            "status": "Trained on synthetic demonstration dataset"
        }

ml_model = IdentityCorrelationMLModel()
