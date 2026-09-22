import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle2, XCircle, Sliders, Shield, BrainCircuit, Activity, Network, FileText, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  { label: 'ShadowFox ↔ Shadow_Fox (High Match)', a: 'ACT-001', b: 'ACT-002' },
  { label: 'CryptoPhantom ↔ PhantomGhost (XMR Link)', a: 'ACT-005', b: 'ACT-006' },
  { label: 'KrakenDread ↔ TentacleOps (Co-Admin)', a: 'ACT-011', b: 'ACT-012' },
  { label: 'DarkWolf ↔ NightWolf (Weak Domain Link)', a: 'ACT-003', b: 'ACT-004' },
  { label: 'ShadowFox ↔ ViperZero (Disjoint / Low)', a: 'ACT-001', b: 'ACT-009' }
];

export default function IdentityComparison({ initialPair, setActiveTab, onGenerateReportFromPair }) {
  const [actors, setActors] = useState([]);
  const [actorA, setActorA] = useState(initialPair?.a || 'ACT-001');
  const [actorB, setActorB] = useState(initialPair?.b || 'ACT-002');
  const [weights, setWeights] = useState({
    alias_similarity: 0.25,
    email_similarity: 0.15,
    pgp_match: 0.20,
    wallet_match: 0.20,
    domain_relationship: 0.10,
    platform_overlap: 0.05,
    temporal_overlap: 0.05
  });
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (initialPair?.a) setActorA(initialPair.a);
    if (initialPair?.b) setActorB(initialPair.b);
  }, [initialPair]);

  useEffect(() => {
    if (actorA && actorB) {
      runComparison();
    }
  }, [actorA, actorB]);

  async function loadActors() {
    try {
      const data = await api.getActors();
      setActors(data);
    } catch (err) {
      console.error("Error fetching actors for comparison:", err);
    }
  }

  async function runComparison(customWeights = null) {
    if (!actorA || !actorB) return;
    try {
      setLoading(true);
      const res = await api.compareIdentities(actorA, actorB, customWeights || weights);
      setResult(res);
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
    if (score >= 60) return 'text-cyan-400 border-cyan-500 bg-cyan-950/40';
    if (score >= 30) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    return 'text-slate-400 border-slate-700 bg-slate-900/40';
  };

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'confirmed_match_candidate':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'possible_match':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'weak_connection':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <span>Identity Correlation & De-anonymization Engine</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-factor cryptographic, infrastructure, and behavioral matching with explainability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightsModal(!showWeightsModal)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tune Weights</span>
          </button>

          {result && (
            <button
              onClick={() => {
                if (onGenerateReportFromPair) onGenerateReportFromPair(actorA, actorB);
                setActiveTab('report');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Selection Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Identity A Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Identity Profile A (Anchor Target)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Select target identity</span>
            </div>
            <select
              value={actorA}
              onChange={(e) => setActorA(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            >
              {actors.map((a) => (
                <option key={a.actor_id} value={a.actor_id}>
                  {a.actor_id} — {a.primary_alias} ({a.risk_level?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Identity B Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Identity Profile B (Candidate Target)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Cross-examine identity</span>
            </div>
            <select
              value={actorB}
              onChange={(e) => setActorB(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            >
              {actors.map((b) => (
                <option key={b.actor_id} value={b.actor_id}>
                  {b.actor_id} — {b.primary_alias} ({b.risk_level?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Testcase Presets */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 mr-1">SIH Test Presets:</span>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setActorA(p.a);
                setActorB(p.b);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                actorA === p.a && actorB === p.b
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weights Tuning Drawer / Card */}
      {showWeightsModal && (
        <div className="p-5 rounded-xl border border-cyan-500/30 bg-slate-900/95 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Heuristic Weight Calibration</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Normalized Sum: 100%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            {Object.keys(weights).map((k) => (
              <div key={k} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span className="capitalize">{k.replace('_', ' ')}</span>
                  <span className="text-cyan-400 font-bold">{Math.round(weights[k] * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.50"
                  step="0.05"
                  value={weights[k]}
                  onChange={(e) => {
                    const newW = { ...weights, [k]: parseFloat(e.target.value) };
                    setWeights(newW);
                    runComparison(newW);
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-slate-400 font-mono space-y-2">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Correlating digital footprints & running ML classification...</p>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Top Correlation Banner */}
          <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Identity Pair Heading */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold text-base">{result.actor_a?.primary_alias}</span>
                    <span className="text-xs text-slate-500 block">({result.actor_a?.actor_id})</span>
                  </div>
                  <span className="text-slate-500 font-bold text-lg">⟷</span>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold text-base">{result.actor_b?.primary_alias}</span>
                    <span className="text-xs text-slate-500 block">({result.actor_b?.actor_id})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${getBadgeStyle(result.rule_based?.badge)}`}>
                    {result.rule_based?.category?.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Combined Confidence: <strong className="text-white">{result.combined_score}%</strong>
                  </span>
                </div>
              </div>

              {/* High-Impact Score Gauge Display */}
              <div className="flex items-center gap-4">
                {/* Rule-Based Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[130px]">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] font-mono mb-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>RULE-BASED</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">
                    {result.rule_based?.correlation_score}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Multi-factor heuristic</span>
                </div>

                {/* ML Classifier Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[130px]">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] font-mono mb-1">
                    <BrainCircuit className="w-3 h-3 text-purple-400" />
                    <span>ML CLASSIFIER</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-purple-400">
                    {result.ml_model?.ml_probability}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">LogReg Calibrated</span>
                </div>
              </div>
            </div>

            {/* Official Academic Disclaimer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>
                {result.rule_based?.disclaimer} Synthetic academic evaluation only.
              </span>
            </div>
          </div>

          {/* Explainability Engine: Supporting Factors & Counter Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supporting Factors (Checkmarks) */}
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-slate-900/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Supporting Evidence ({result.rule_based?.supporting_factors?.length || 0})</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Positive Correlation</span>
              </div>

              {result.rule_based?.supporting_factors?.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic py-4 text-center">
                  No overlapping cryptographic or digital footprints discovered between identities.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {result.rule_based?.supporting_factors?.map((factor, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-emerald-950 flex items-start space-x-2.5">
                      <span className="text-emerald-400 font-bold text-sm mt-0.5">✓</span>
                      <span className="text-xs font-mono text-slate-200 leading-relaxed">{factor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Counter-Evidence (Crosses) */}
            <div className="p-5 rounded-xl border border-red-500/20 bg-slate-900/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Counter-Evidence ({result.rule_based?.counter_evidence?.length || 0})</span>
                </h3>
                <span className="text-[10px] font-mono text-red-400 uppercase font-semibold">Divergent Indicators</span>
              </div>

              {result.rule_based?.counter_evidence?.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic py-4 text-center">
                  No direct conflicting evidence observed.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {result.rule_based?.counter_evidence?.map((item, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-red-950 flex items-start space-x-2.5">
                      <span className="text-red-400 font-bold text-sm mt-0.5">✗</span>
                      <span className="text-xs font-mono text-slate-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detailed Feature Points Breakdown */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
            <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Correlation Feature Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Object.entries(result.rule_based?.feature_breakdown || {}).map(([key, val]) => (
                <div key={key} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block truncate uppercase">
                    {key.replace('_', ' ')}
                  </span>
                  <div className="text-lg font-bold text-slate-100 mt-1">
                    {val.raw_score}%
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">
                    +{val.weighted_points} pts
                  </div>
                  <div className="text-[9px] text-slate-500">
                    wt: {val.weight_pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graph Connection Path Summary */}
          {result.graph_path && result.graph_path.length > 0 && (
            <div className="p-5 rounded-xl border border-purple-500/30 bg-slate-900/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span>Shortest Network Path Found</span>
                </h3>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="text-xs text-purple-400 hover:underline font-mono flex items-center space-x-1"
                >
                  <span>Open in Full Graph View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2 font-mono text-xs">
                {result.graph_path.map((hop, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                      {hop.from_node?.label}
                    </span>
                    <span className="text-purple-400 text-[10px] uppercase font-bold">
                      —[{hop.relationship}]→
                    </span>
                    {i === result.graph_path.length - 1 && (
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                        {hop.to_node?.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
