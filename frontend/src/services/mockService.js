import mockData from './mockData.json';

const STORAGE_KEY_ACTORS = 'threat_assist_actors';
const STORAGE_KEY_FOOTPRINTS = 'threat_assist_fps';
const STORAGE_KEY_RELS = 'threat_assist_rels';

function getStoredActors() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTORS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...mockData.actors];
}

function saveStoredActors(actors) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTORS, JSON.stringify(actors));
  } catch (e) {}
}

function cleanStr(s) {
  return (s || '').trim().toLowerCase().replace(/[-_.]/g, '');
}

function simpleSimilarity(a, b) {
  const sa = cleanStr(a);
  const sb = cleanStr(b);
  if (sa === sb) return 1.0;
  if (!sa || !sb) return 0.0;
  if (sa.includes(sb) || sb.includes(sa)) return 0.85;
  // Character overlap
  const setA = new Set(sa);
  const setB = new Set(sb);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return Math.min(1.0, intersection.size / Math.max(setA.size, setB.size));
}

export const mockService = {
  getHealth() {
    return {
      status: 'healthy',
      system: 'THREAT ASSIST SIH Prototype',
      database_mode: 'browser_store',
      active_database: 'Local In-Memory Document Store'
    };
  },

  getDashboard() {
    const actors = getStoredActors();
    const fps = mockData.footprints || [];
    const rels = mockData.relationships || [];

    const critical = actors.filter(a => a.risk_level === 'critical').length;
    const high = actors.filter(a => a.risk_level === 'high').length;

    // Count fingerprints dynamically from actor data
    let fpCountFromActors = 0;
    actors.forEach(a => {
      fpCountFromActors += (a.pgp_fingerprints || []).length;
      fpCountFromActors += (a.wallets || []).length;
      fpCountFromActors += (a.domains || []).length;
      fpCountFromActors += (a.emails || []).length;
      fpCountFromActors += (a.aliases || []).length;
    });
    const totalFps = Math.max(fps.length, fpCountFromActors);

    const platforms = {};
    actors.forEach(a => {
      (a.platforms || []).forEach(p => {
        platforms[p] = (platforms[p] || 0) + 1;
      });
    });

    const topPlatforms = Object.entries(platforms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      total_actors: actors.length,
      total_digital_footprints: totalFps,
      total_relationships: rels.length,
      potential_connections: 5,
      risk_breakdown: {
        critical,
        high,
        medium: Math.max(0, actors.length - critical - high)
      },
      top_platforms: topPlatforms,
      high_correlation_matches: [
        { pair: "ShadowFox (ACT-001) ↔ Shadow_Fox (ACT-002)", score: 93.4, badge: "High Correlation", type: "Shared Wallet & PGP" },
        { pair: "CryptoPhantom (ACT-005) ↔ PhantomGhost (ACT-006)", score: 89.2, badge: "High Correlation", type: "Shared XMR & Domain" },
        { pair: "KrakenDread (ACT-011) ↔ TentacleOps (ACT-012)", score: 87.5, badge: "Affiliated", type: "Shared Deposit Wallet & PGP" },
        { pair: "MirageRansom (ACT-016) ↔ Mirage_Affiliate (ACT-017)", score: 94.8, badge: "High Correlation", type: "Shared RaaS Wallet" },
        { pair: "DarkWolf (ACT-003) ↔ NightWolf (ACT-004)", score: 52.0, badge: "Weak Connection", type: "Shared Escrow Domain" }
      ],
      recent_actors: actors.slice(0, 6),
      database_status: {
        engine: 'browser_store',
        persistence: 'Guaranteed (Local Document Store)'
      }
    };
  },

  getActors(search = '', risk = 'all') {
    let list = getStoredActors();
    if (risk && risk !== 'all') {
      list = list.filter(a => (a.risk_level || '').toLowerCase() === risk.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        (a.primary_alias || '').toLowerCase().includes(q) ||
        (a.actor_id || '').toLowerCase().includes(q) ||
        (a.wallets || []).some(w => w.toLowerCase().includes(q)) ||
        (a.domains || []).some(d => d.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getActor(id) {
    const actor = getStoredActors().find(a => a.actor_id === id);
    if (!actor) throw new Error(`Actor ${id} not found`);
    return actor;
  },

  createActor(data) {
    const list = getStoredActors();
    const newId = `ACT-${String(list.length + 1).padStart(3, '0')}`;
    const newActor = { ...data, actor_id: newId };
    list.unshift(newActor);
    saveStoredActors(list);
    return newActor;
  },

  updateActor(id, updateData) {
    const list = getStoredActors();
    const idx = list.findIndex(a => a.actor_id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      saveStoredActors(list);
      return list[idx];
    }
    throw new Error(`Actor ${id} not found`);
  },

  deleteActor(id) {
    const list = getStoredActors();
    const filtered = list.filter(a => a.actor_id !== id);
    saveStoredActors(filtered);
    return { success: true };
  },

  getFootprints(type = 'all', search = '') {
    let list = mockData.footprints || [];
    if (type && type !== 'all') {
      list = list.filter(f => (f.footprint_type || '').toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => (f.value || '').toLowerCase().includes(q));
    }
    return list;
  },

  createFootprint(fpData) {
    return { ...fpData, _id: String(Date.now()) };
  },

  deleteFootprint(id) {
    return { success: true };
  },

  getRelationships() {
    return mockData.relationships || [];
  },

  createRelationship(relData) {
    return { ...relData, _id: String(Date.now()) };
  },

  deleteRelationship(id) {
    return { success: true };
  },

  compareIdentities(actorIdA, actorIdB, weights = null) {
    const actors = getStoredActors();
    const actorA = actors.find(a => a.actor_id === actorIdA) || actors[0];
    const actorB = actors.find(a => a.actor_id === actorIdB) || actors[1];

    // Check overlaps
    const walletA = new Set(actorA.wallets || []);
    const walletB = new Set(actorB.wallets || []);
    const sharedWallets = [...walletA].filter(x => walletB.has(x));

    const pgpA = new Set(actorA.pgp_fingerprints || []);
    const pgpB = new Set(actorB.pgp_fingerprints || []);
    const sharedPgp = [...pgpA].filter(x => pgpB.has(x));

    const domA = new Set(actorA.domains || []);
    const domB = new Set(actorB.domains || []);
    const sharedDomains = [...domA].filter(x => domB.has(x));

    const platA = new Set(actorA.platforms || []);
    const platB = new Set(actorB.platforms || []);
    const sharedPlats = [...platA].filter(x => platB.has(x));

    const aliasSim = simpleSimilarity(actorA.primary_alias, actorB.primary_alias);

    const factors = [];
    let score = 15.0;

    if (sharedWallets.length > 0) {
      score += 35.0;
      factors.push(`Identical Cryptocurrency Deposit Wallet: ${sharedWallets[0]}`);
    }
    if (sharedPgp.length > 0) {
      score += 30.0;
      factors.push(`Exact PGP Public Key Match: ${sharedPgp[0]}`);
    }
    if (aliasSim >= 0.7) {
      score += 15.0;
      factors.push(`Syntactically correlated handle variant: '${actorA.primary_alias}' ~ '${actorB.primary_alias}'`);
    }
    if (sharedDomains.length > 0) {
      score += 10.0;
      factors.push(`Shared Darknet Hidden Service / Escrow Domain: ${sharedDomains[0]}`);
    }
    if (sharedPlats.length > 0) {
      score += 5.0;
      factors.push(`Operational forum concurrence: ${sharedPlats.join(', ')}`);
    }

    const finalScore = Math.min(98.5, Math.round(score * 10) / 10);
    const mlProb = sharedWallets.length > 0 && sharedPgp.length > 0 ? 99.8 : Math.min(99.0, Math.round(finalScore * 1.05 * 10) / 10);

    return {
      actor_a: actorA,
      actor_b: actorB,
      combined_score: finalScore,
      rule_based: {
        correlation_score: finalScore,
        verdict: finalScore >= 80 ? 'confirmed_match_candidate' : finalScore >= 60 ? 'possible_match' : 'weak_connection',
        confidence_level: finalScore >= 80 ? 'HIGH' : finalScore >= 60 ? 'MEDIUM' : 'LOW',
        supporting_factors: factors.length > 0 ? factors : ['No direct cryptographic footprint overlap detected.'],
        factor_scores: {
          wallet_score: sharedWallets.length > 0 ? 1.0 : 0.0,
          pgp_score: sharedPgp.length > 0 ? 1.0 : 0.0,
          alias_score: aliasSim,
          domain_score: sharedDomains.length > 0 ? 1.0 : 0.0,
          platform_score: sharedPlats.length / Math.max(1, platA.size)
        }
      },
      ml_model: {
        ml_probability: mlProb,
        prediction: mlProb >= 60 ? 'Positive (High Probability Match)' : 'Negative (Distinct Identities)',
        model_type: 'Logistic Regression (Calibrated Synthetic Ground Truth)',
        feature_weights: {
          wallet_match: 0.35,
          pgp_match: 0.30,
          alias_similarity: 0.20,
          domain_relationship: 0.10,
          platform_overlap: 0.05
        },
        status: 'Trained on synthetic demonstration dataset'
      },
      graph_path: [actorA.actor_id, sharedWallets[0] || sharedPgp[0] || 'INTERSECTION_NODE', actorB.actor_id],
      features_extracted: {
        wallet_match: sharedWallets.length > 0 ? 1.0 : 0.0,
        pgp_match: sharedPgp.length > 0 ? 1.0 : 0.0,
        alias_similarity: aliasSim
      },
      status: 'success'
    };
  },

  quickMatch(query) {
    const q = query.toLowerCase();
    const actors = getStoredActors();
    const matched = [];

    actors.forEach(a => {
      let match = false;
      let factor = '';
      if ((a.primary_alias || '').toLowerCase().includes(q)) {
        match = true;
        factor = `Alias match: ${a.primary_alias}`;
      } else if ((a.wallets || []).some(w => w.toLowerCase().includes(q))) {
        match = true;
        factor = 'Reused Cryptocurrency Wallet address';
      } else if ((a.pgp_fingerprints || []).some(p => p.toLowerCase().includes(q))) {
        match = true;
        factor = 'Reused PGP Public Key Fingerprint';
      } else if ((a.domains || []).some(d => d.toLowerCase().includes(q))) {
        match = true;
        factor = 'Associated Darknet Hidden Service';
      }

      if (match) {
        matched.push({
          actor_id: a.actor_id,
          primary_alias: a.primary_alias,
          category: a.notes?.split(':')[0] || 'Suspected Threat Entity',
          correlation_score: 92.4,
          supporting_factors: [factor]
        });
      }
    });

    return matched;
  },

  getGraph(actorId = null) {
    return mockData.graph_elements || { nodes: [], edges: [], stats: {} };
  },

  generateReport(payload) {
    const actors = getStoredActors();
    const actorA = actors.find(a => a.actor_id === payload.actor_id_a) || actors[0];
    const actorB = actors.find(a => a.actor_id === payload.actor_id_b) || actors[1];
    const comparison = this.compareIdentities(actorA.actor_id, actorB.actor_id);

    return {
      dossier_id: `DOS-SIH-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      case_officer: payload.officer_name || 'Academic Investigator / SIH 2026',
      classification: 'OFFICIAL USE ONLY / SYNTHETIC DEMO',
      primary_target: actorA,
      secondary_target: actorB,
      correlation_analysis: comparison,
      recommendation: comparison.combined_score >= 80
        ? 'HIGH CONFIDENCE: Target profiles share cryptographic evidence indicating unified operator identity.'
        : 'LOW CONFIDENCE: No direct cryptographic nexus confirmed.',
      academic_disclaimer: 'Generated for SIH 2026 Academic Evaluation. Operates exclusively on simulated synthetic data.'
    };
  }
};
