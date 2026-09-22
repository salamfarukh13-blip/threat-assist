import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, GitCompare, Network, Shield, Copy, Check, Calendar, Globe, Key, Wallet, Mail } from 'lucide-react';
import { api } from '../services/api';

export default function ActorDatabase({ setActiveTab, onSelectPairForCompare, onSelectActorForGraph }) {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedActor, setSelectedActor] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    loadActors();
  }, [search, riskFilter]);

  async function loadActors() {
    try {
      setLoading(true);
      const data = await api.getActors(search, riskFilter);
      setActors(data);
      if (!selectedActor && data.length > 0) {
        setSelectedActor(data[0]);
      }
    } catch (err) {
      console.error("Error loading actors:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/80 font-mono text-[11px] font-bold">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80 font-mono text-[11px] font-semibold">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/80 font-mono text-[11px]">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-[11px]">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <span>Threat Actor Repository</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono">
              {actors.length} Total Targets
            </span>
          </h1>
          <p className="text-xs text-slate-400">Search and filter across synthetic threat-actor footprints</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alias, wallet, PGP..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-all ${
                  riskFilter === level
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Actor Table + Detailed Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actors Table (2 cols) */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Actor ID / Alias</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Primary Footprints</th>
                  <th className="py-3 px-4">Platforms</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {actors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No synthetic actors matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  actors.map((actor) => {
                    const isSelected = selectedActor?.actor_id === actor.actor_id;
                    return (
                      <tr
                        key={actor.actor_id}
                        onClick={() => setSelectedActor(actor)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200">{actor.primary_alias}</div>
                          <div className="text-[10px] text-cyan-400/80">{actor.actor_id}</div>
                        </td>
                        <td className="py-3 px-4">{getRiskBadge(actor.risk_level)}</td>
                        <td className="py-3 px-4 max-w-[200px] truncate text-slate-400">
                          {actor.wallets?.[0] ? (
                            <span className="text-emerald-400/90 truncate block">
                              👛 {actor.wallets[0].slice(0, 14)}...
                            </span>
                          ) : null}
                          {actor.pgp_fingerprints?.[0] ? (
                            <span className="text-purple-400/90 truncate block text-[10px]">
                              🔑 {actor.pgp_fingerprints[0].slice(0, 16)}...
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {actor.platforms?.slice(0, 2).map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (onSelectPairForCompare) onSelectPairForCompare(actor.actor_id, 'ACT-002');
                              setActiveTab('compare');
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all"
                            title="Compare in Correlation Engine"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (onSelectActorForGraph) onSelectActorForGraph(actor.actor_id);
                              setActiveTab('graph');
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all"
                            title="Inspect in Graph"
                          >
                            <Network className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Actor Detail Dossier (1 col) */}
        {selectedActor && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Target Dossier
                </span>
                <h2 className="text-xl font-bold text-white font-mono">{selectedActor.primary_alias}</h2>
                <span className="text-xs text-slate-400 font-mono">{selectedActor.actor_id}</span>
              </div>
              <div>{getRiskBadge(selectedActor.risk_level)}</div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onSelectPairForCompare) onSelectPairForCompare(selectedActor.actor_id, 'ACT-002');
                  setActiveTab('compare');
                }}
                className="py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Correlate Target</span>
              </button>
              <button
                onClick={() => {
                  if (onSelectActorForGraph) onSelectActorForGraph(selectedActor.actor_id);
                  setActiveTab('graph');
                }}
                className="py-2 px-3 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <Network className="w-3.5 h-3.5" />
                <span>View Network</span>
              </button>
            </div>

            {/* Metadata Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TIMEZONE</span>
                <span className="text-slate-200">{selectedActor.timezone || 'UTC+00:00'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LANGUAGE</span>
                <span className="text-slate-200">{selectedActor.language || 'English'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">TIMELINE WINDOW</span>
                <span className="text-slate-200">{selectedActor.first_seen} → {selectedActor.last_seen}</span>
              </div>
            </div>

            {/* Aliases List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold block uppercase">Recorded Aliases</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedActor.aliases?.map((al, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono text-xs">
                    {al}
                  </span>
                ))}
              </div>
            </div>

            {/* Wallets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold block uppercase flex items-center space-x-1">
                <Wallet className="w-3 h-3 text-emerald-400" />
                <span>Cryptocurrency Wallets</span>
              </span>
              <div className="space-y-1">
                {selectedActor.wallets?.map((w, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-emerald-400 truncate max-w-[220px]">{w}</span>
                    <button
                      onClick={() => handleCopy(w, `w-${idx}`)}
                      className="text-slate-400 hover:text-white ml-2"
                      title="Copy Wallet"
                    >
                      {copiedKey === `w-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PGP Fingerprints */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold block uppercase flex items-center space-x-1">
                <Key className="w-3 h-3 text-purple-400" />
                <span>PGP Public Fingerprint</span>
              </span>
              <div className="space-y-1">
                {selectedActor.pgp_fingerprints?.map((pgp, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-purple-300 truncate max-w-[220px]">{pgp}</span>
                    <button
                      onClick={() => handleCopy(pgp, `pgp-${idx}`)}
                      className="text-slate-400 hover:text-white ml-2"
                    >
                      {copiedKey === `pgp-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Domains / Onion Services */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold block uppercase flex items-center space-x-1">
                <Globe className="w-3 h-3 text-pink-400" />
                <span>Associated Onion Services</span>
              </span>
              <div className="space-y-1">
                {selectedActor.domains?.map((dom, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-pink-300">
                    {dom}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes / Intel summary */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono font-bold block">INTELLIGENCE BRIEF</span>
              <p className="italic text-slate-400">{selectedActor.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
