import React, { useState, useEffect } from 'react';
import { Shield, Users, Fingerprint, Link2, Search, ArrowRight, AlertTriangle, ExternalLink, Zap } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, onSelectPairForCompare }) {
  const [metrics, setMetrics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const results = await api.quickMatch(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner / Header */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 cyber-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>THREAT INTELLIGENCE PLATFORM — SYNTHETIC DATASET</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              Dark Web Threat Actor De-anonymization
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Cross-correlate fragmented pseudonymous footprints — wallets, PGP keys, aliases, emails, and onion infrastructure — using explainable heuristic scoring and machine learning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onSelectPairForCompare) onSelectPairForCompare('ACT-001', 'ACT-002');
                setActiveTab('compare');
              }}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wide uppercase hover:bg-cyan-400 transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Run Demo Correlation (ShadowFox)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase font-mono">Synthetic Actors</p>
            <h3 className="text-2xl font-bold text-white font-mono">{metrics?.total_actors || 25}</h3>
            <p className="text-[11px] text-blue-400">Tracked in database</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase font-mono">Digital Footprints</p>
            <h3 className="text-2xl font-bold text-white font-mono">{metrics?.total_digital_footprints || 154}</h3>
            <p className="text-[11px] text-emerald-400">Wallets, PGP, Aliases, URLs</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase font-mono">Graph Relationships</p>
            <h3 className="text-2xl font-bold text-white font-mono">{metrics?.total_relationships || 233}</h3>
            <p className="text-[11px] text-purple-400">Cross-entity links</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase font-mono">Critical Targets</p>
            <h3 className="text-2xl font-bold text-white font-mono">{metrics?.risk_breakdown?.critical || 6}</h3>
            <p className="text-[11px] text-red-400">High impact ransomware / syndicates</p>
          </div>
        </div>
      </div>

      {/* Universal Footprint Search Bar */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query any identifier: ShadowFox, bc1qxy2kgdy..., 9B2A 78C1..., shadowmarket-leak.onion"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all flex items-center justify-center space-x-2 font-mono"
          >
            {isSearching ? <span className="animate-spin">⟳</span> : <Search className="w-4 h-4" />}
            <span>Correlate</span>
          </button>
        </form>

        {/* Search Results Preview */}
        {searchResults.length > 0 && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400 uppercase">Found {searchResults.length} Correlated Candidates:</span>
              <button onClick={() => setSearchResults([])} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {searchResults.map((res) => (
                <div key={res.actor_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-300 font-semibold">{res.primary_alias}</span>
                      <span className="text-xs text-slate-500 font-mono">({res.actor_id})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{res.supporting_factors?.[0] || res.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-emerald-400">{res.correlation_score}%</span>
                    <button
                      onClick={() => {
                        if (onSelectPairForCompare) onSelectPairForCompare(res.actor_id, 'ACT-001');
                        setActiveTab('compare');
                      }}
                      className="block text-[11px] text-cyan-400 hover:underline mt-0.5"
                    >
                      Compare →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Grid: Known High-Correlation Matches & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Correlation Matches */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>High-Confidence Identity Overlap Clusters</span>
              </h2>
              <p className="text-xs text-slate-400">Pre-seeded intentional overlaps to demonstrate matching accuracy</p>
            </div>
          </div>

          <div className="space-y-3">
            {metrics?.high_correlation_matches?.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-semibold text-slate-200">{item.pair}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-mono text-[10px]">{item.type}</span>
                    <span>• Verified Synthetic Pair</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className={`text-base font-bold font-mono ${item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.score}%
                    </span>
                    <span className="block text-[10px] text-slate-400">{item.badge}</span>
                  </div>
                  <button
                    onClick={() => {
                      const matchA = item.pair.match(/\((ACT-\d+)\)/g);
                      const idA = matchA?.[0]?.replace(/[()]/g, '') || 'ACT-001';
                      const idB = matchA?.[1]?.replace(/[()]/g, '') || 'ACT-002';
                      if (onSelectPairForCompare) onSelectPairForCompare(idA, idB);
                      setActiveTab('compare');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition-all"
                    title="Investigate Pair"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Monitored Platforms */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-mono mb-1">Observed Darknet Platforms</h2>
            <p className="text-xs text-slate-400 mb-4">Distribution of synthetic actor footprints</p>

            <div className="space-y-3">
              {metrics?.top_platforms?.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">{p.name}</span>
                    <span className="text-cyan-400 font-bold">{p.count} actors</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (p.count / 25) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-amber-400 font-semibold font-mono block">SUGGESTED INVESTIGATION FLOW:</span>
            <p>1. Review ACT-001 (ShadowFox) in the Actor Database.</p>
            <p>2. Compare with ACT-002 (Shadow_Fox) in Identity Correlation.</p>
            <p>3. Inspect Graph links and generate an official Case Dossier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
