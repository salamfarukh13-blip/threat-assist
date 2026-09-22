import logging
from typing import Dict, Any, List, Tuple
from rapidfuzz import fuzz
from datetime import datetime

logger = logging.getLogger("threat_assist.matching")

DEFAULT_WEIGHTS = {
    "alias_similarity": 0.25,
    "email_similarity": 0.15,
    "pgp_match": 0.20,
    "wallet_match": 0.20,
    "domain_relationship": 0.10,
    "platform_overlap": 0.05,
    "temporal_overlap": 0.05
}

def clean_str(s: str) -> str:
    return s.strip().lower().replace("_", "").replace("-", "").replace(".", "")

def parse_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        return datetime(2025, 1, 1)

class IdentityMatchingEngine:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS
        # Normalize weights so sum is 1.0
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: v / total for k, v in self.weights.items()}

    def calculate_alias_score(self, aliases_a: List[str], aliases_b: List[str]) -> Tuple[float, List[str]]:
        if not aliases_a or not aliases_b:
            return 0.0, []
        best_score = 0.0
        best_pair = None
        for a in aliases_a:
            for b in aliases_b:
                # Direct match
                if clean_str(a) == clean_str(b):
                    return 1.0, [f"Exact normalized alias match: '{a}' == '{b}'"]
                # Fuzzy match
                score = fuzz.token_sort_ratio(a.lower(), b.lower()) / 100.0
                if score > best_score:
                    best_score = score
                    best_pair = (a, b)
        evidence = []
        if best_pair and best_score >= 0.70:
            evidence.append(f"High alias similarity ({int(best_score*100)}%): '{best_pair[0]}' ~ '{best_pair[1]}'")
        elif best_pair and best_score >= 0.50:
            evidence.append(f"Moderate alias similarity ({int(best_score*100)}%): '{best_pair[0]}' ~ '{best_pair[1]}'")
        return best_score, evidence

    def calculate_email_score(self, emails_a: List[str], emails_b: List[str]) -> Tuple[float, List[str]]:
        if not emails_a or not emails_b:
            return 0.0, []
        exact_matches = set(emails_a).intersection(set(emails_b))
        if exact_matches:
            return 1.0, [f"Exact shared email address: {', '.join(exact_matches)}"]
        
        # Check usernames before '@' and domain overlap
        best_score = 0.0
        best_reason = ""
        for ea in emails_a:
            user_a, *dom_a = ea.split("@")
            for eb in emails_b:
                user_b, *dom_b = eb.split("@")
                user_sim = fuzz.ratio(user_a.lower(), user_b.lower()) / 100.0
                same_domain = (dom_a == dom_b and len(dom_a) > 0)
                score = user_sim * (0.8 if same_domain else 0.5)
                if score > best_score:
                    best_score = score
                    best_reason = f"Email username pattern similarity ({int(user_sim*100)}%): '{user_a}' ~ '{user_b}'"
        
        evidence = [best_reason] if best_score >= 0.50 and best_reason else []
        return best_score, evidence

    def calculate_exact_match(self, items_a: List[str], items_b: List[str], label: str) -> Tuple[float, List[str]]:
        if not items_a or not items_b:
            return 0.0, []
        set_a = {clean_str(x) for x in items_a}
        set_b = {clean_str(x) for x in items_b}
        shared = set_a.intersection(set_b)
        if shared:
            # Find original representations
            orig = [x for x in items_a if clean_str(x) in shared]
            return 1.0, [f"Identical {label} observed: {', '.join(orig)}"]
        return 0.0, []

    def calculate_domain_overlap(self, doms_a: List[str], doms_b: List[str]) -> Tuple[float, List[str]]:
        if not doms_a or not doms_b:
            return 0.0, []
        set_a = {d.strip().lower() for d in doms_a}
        set_b = {d.strip().lower() for d in doms_b}
        shared = set_a.intersection(set_b)
        if shared:
            return 1.0, [f"Shared infrastructure / domain: {', '.join(shared)}"]
        # Check partial domain overlap
        for da in set_a:
            for db in set_b:
                if da in db or db in da:
                    return 0.7, [f"Infrastructure domain correlation: '{da}' ~ '{db}'"]
        return 0.0, []

    def calculate_platform_overlap(self, plats_a: List[str], plats_b: List[str]) -> Tuple[float, List[str]]:
        if not plats_a or not plats_b:
            return 0.0, []
        set_a = {p.strip().lower() for p in plats_a}
        set_b = {p.strip().lower() for p in plats_b}
        shared = set_a.intersection(set_b)
        if shared:
            ratio = len(shared) / max(len(set_a.union(set_b)), 1)
            orig_matches = [p for p in plats_a if p.strip().lower() in shared]
            return min(1.0, 0.4 + 0.6 * ratio), [f"Shared active platforms: {', '.join(orig_matches)}"]
        return 0.0, []

    def calculate_temporal_overlap(self, a: Dict[str, Any], b: Dict[str, Any]) -> Tuple[float, List[str]]:
        try:
            start_a = parse_date(a.get("first_seen", "2025-01-01"))
            end_a = parse_date(a.get("last_seen", "2026-03-01"))
            start_b = parse_date(b.get("first_seen", "2025-01-01"))
            end_b = parse_date(b.get("last_seen", "2026-03-01"))

            overlap_start = max(start_a, start_b)
            overlap_end = min(end_a, end_b)

            if overlap_start <= overlap_end:
                days = (overlap_end - overlap_start).days
                evidence = [f"Overlapping activity timeline ({days} active days in common)"]
                return 1.0, evidence
            else:
                gap = (overlap_start - overlap_end).days
                return 0.0, [f"Timeline gap: {gap} days between observed activity periods"]
        except Exception:
            return 0.5, ["Timeline estimation: concurrent activity period"]

    def extract_features(self, a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, float]:
        """Extract numeric features (0.0 to 1.0) for scoring and ML input."""
        alias_score, _ = self.calculate_alias_score(a.get("aliases", []), b.get("aliases", []))
        email_score, _ = self.calculate_email_score(a.get("emails", []), b.get("emails", []))
        pgp_score, _ = self.calculate_exact_match(a.get("pgp_fingerprints", []), b.get("pgp_fingerprints", []), "PGP")
        wallet_score, _ = self.calculate_exact_match(a.get("wallets", []), b.get("wallets", []), "wallet")
        domain_score, _ = self.calculate_domain_overlap(a.get("domains", []), b.get("domains", []))
        plat_score, _ = self.calculate_platform_overlap(a.get("platforms", []), b.get("platforms", []))
        temp_score, _ = self.calculate_temporal_overlap(a, b)

        return {
            "alias_similarity": float(alias_score),
            "email_similarity": float(email_score),
            "pgp_match": float(pgp_score),
            "wallet_match": float(wallet_score),
            "domain_relationship": float(domain_score),
            "platform_overlap": float(plat_score),
            "temporal_overlap": float(temp_score)
        }

    def compare(self, a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
        features = self.extract_features(a, b)
        
        supporting_factors = []
        counter_evidence = []
        shared_footprints = []

        # Alias
        _, alias_ev = self.calculate_alias_score(a.get("aliases", []), b.get("aliases", []))
        if features["alias_similarity"] >= 0.6:
            supporting_factors.extend(alias_ev)
        elif features["alias_similarity"] < 0.3:
            counter_evidence.append(f"Distinct primary aliases: '{a.get('primary_alias')}' vs '{b.get('primary_alias')}'")

        # Email
        _, email_ev = self.calculate_email_score(a.get("emails", []), b.get("emails", []))
        if features["email_similarity"] >= 0.5:
            supporting_factors.extend(email_ev)
            shared_footprints.extend([f"Email pattern: {e}" for e in email_ev])
        else:
            if a.get("emails") and b.get("emails"):
                counter_evidence.append("Different registered contact emails")

        # PGP
        _, pgp_ev = self.calculate_exact_match(a.get("pgp_fingerprints", []), b.get("pgp_fingerprints", []), "PGP key")
        if features["pgp_match"] > 0:
            supporting_factors.extend(pgp_ev)
            shared_footprints.extend(pgp_ev)
        else:
            if a.get("pgp_fingerprints") and b.get("pgp_fingerprints"):
                counter_evidence.append("Different PGP public key fingerprints")

        # Wallet
        _, wallet_ev = self.calculate_exact_match(a.get("wallets", []), b.get("wallets", []), "cryptocurrency wallet")
        if features["wallet_match"] > 0:
            supporting_factors.extend(wallet_ev)
            shared_footprints.extend(wallet_ev)
        else:
            if a.get("wallets") and b.get("wallets"):
                counter_evidence.append("Distinct cryptocurrency payout addresses")

        # Domain
        _, dom_ev = self.calculate_domain_overlap(a.get("domains", []), b.get("domains", []))
        if features["domain_relationship"] > 0:
            supporting_factors.extend(dom_ev)
            shared_footprints.extend(dom_ev)

        # Platform
        _, plat_ev = self.calculate_platform_overlap(a.get("platforms", []), b.get("platforms", []))
        if features["platform_overlap"] > 0:
            supporting_factors.extend(plat_ev)
        else:
            counter_evidence.append("Zero observed platform intersection")

        # Timezone check as counter-evidence if conflicting
        tz_a = a.get("timezone")
        tz_b = b.get("timezone")
        if tz_a and tz_b and tz_a != tz_b:
            counter_evidence.append(f"Different configured timezones ({tz_a} vs {tz_b})")

        # Language check
        lang_a = a.get("language", "")
        lang_b = b.get("language", "")
        if lang_a and lang_b and not any(l.strip() in lang_b for l in lang_a.split("/")):
            counter_evidence.append(f"Different observed communications language ({lang_a} vs {lang_b})")

        # Weighted calculation
        total_score = sum(features[k] * self.weights.get(k, 0.0) for k in features)
        score_100 = round(total_score * 100.0, 1)

        # Categorization
        if score_100 >= 80:
            category = "Strong correlation"
            badge = "confirmed_match_candidate"
        elif score_100 >= 60:
            category = "Possible correlation"
            badge = "possible_match"
        elif score_100 >= 30:
            category = "Weak correlation"
            badge = "weak_connection"
        else:
            category = "Low correlation"
            badge = "no_meaningful_connection"

        return {
            "correlation_score": score_100,
            "category": category,
            "badge": badge,
            "weights_used": self.weights,
            "feature_breakdown": {
                k: {
                    "raw_score": round(features[k] * 100, 1),
                    "weight_pct": round(self.weights.get(k, 0.0) * 100, 1),
                    "weighted_points": round(features[k] * self.weights.get(k, 0.0) * 100, 1)
                } for k in features
            },
            "supporting_factors": supporting_factors,
            "counter_evidence": counter_evidence,
            "shared_digital_footprints": shared_footprints,
            "disclaimer": "Potential identity relationship (requires human verification - synthetic demonstration data)."
        }

engine = IdentityMatchingEngine()
