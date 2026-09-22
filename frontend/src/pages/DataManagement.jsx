import React, { useState, useEffect } from 'react';
import { Database, Plus, Edit2, Trash2, Save, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function DataManagement() {
  const [activeSubTab, setActiveSubTab] = useState('actors'); // actors, footprints, relationships
  const [actors, setActors] = useState([]);
  const [footprints, setFootprints] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Modal State
  const [showActorModal, setShowActorModal] = useState(false);
  const [actorFormData, setActorFormData] = useState({
    actor_id: '',
    primary_alias: '',
    aliases: '',
    emails: '',
    pgp_fingerprints: '',
    wallets: '',
    domains: '',
    platforms: '',
    language: 'English',
    timezone: 'UTC+00:00',
    first_seen: '2025-01-01',
    last_seen: '2026-03-01',
    risk_level: 'medium',
    notes: 'Synthetic demonstration record'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Footprint Modal
  const [showFpModal, setShowFpModal] = useState(false);
  const [fpFormData, setFpFormData] = useState({
    type: 'alias',
    value: '',
    associated_actors: '',
    platform: 'Forum-Mock'
  });

  // Relationship Modal
  const [showRelModal, setShowRelModal] = useState(false);
  const [relFormData, setRelFormData] = useState({
    source: '',
    target: '',
    relationship: 'USES_WALLET',
    confidence: 0.95,
    evidence: 'Observed in synthetic records'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [actData, fpData, relData] = await Promise.all([
        api.getActors(),
        api.getFootprints(),
        api.getRelationships()
      ]);
      setActors(actData);
      setFootprints(fpData);
      setRelationships(relData);
    } catch (err) {
      console.error('Error fetching data for management:', err);
    } finally {
      setLoading(false);
    }
  }

  function notify(msg, isError = false) {
    setStatusMessage({ text: msg, error: isError });
    setTimeout(() => setStatusMessage(null), 3500);
  }

  // Handle Actor Create/Edit
  async function handleSaveActor(e) {
    e.preventDefault();
    try {
      const payload = {
        ...actorFormData,
        aliases: typeof actorFormData.aliases === 'string' ? actorFormData.aliases.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.aliases,
        emails: typeof actorFormData.emails === 'string' ? actorFormData.emails.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.emails,
        pgp_fingerprints: typeof actorFormData.pgp_fingerprints === 'string' ? actorFormData.pgp_fingerprints.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.pgp_fingerprints,
        wallets: typeof actorFormData.wallets === 'string' ? actorFormData.wallets.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.wallets,
        domains: typeof actorFormData.domains === 'string' ? actorFormData.domains.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.domains,
        platforms: typeof actorFormData.platforms === 'string' ? actorFormData.platforms.split(',').map((s) => s.trim()).filter(Boolean) : actorFormData.platforms,
      };

      if (isEditing) {
        await api.updateActor(actorFormData.actor_id, payload);
        notify(`Actor ${actorFormData.actor_id} successfully updated!`);
      } else {
        await api.createActor(payload);
        notify(`New synthetic actor ${actorFormData.actor_id} created!`);
      }
      setShowActorModal(false);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function handleDeleteActor(actorId) {
    if (!window.confirm(`Are you sure you want to delete synthetic actor ${actorId}?`)) return;
    try {
      await api.deleteActor(actorId);
      notify(`Actor ${actorId} deleted.`);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  function openEditActor(actor) {
    setIsEditing(true);
    setActorFormData({
      ...actor,
      aliases: (actor.aliases || []).join(', '),
      emails: (actor.emails || []).join(', '),
      pgp_fingerprints: (actor.pgp_fingerprints || []).join(', '),
      wallets: (actor.wallets || []).join(', '),
      domains: (actor.domains || []).join(', '),
      platforms: (actor.platforms || []).join(', '),
    });
    setShowActorModal(true);
  }

  function openNewActor() {
    setIsEditing(false);
    setActorFormData({
      actor_id: `ACT-${String(actors.length + 1).padStart(3, '0')}`,
      primary_alias: '',
      aliases: '',
      emails: '',
      pgp_fingerprints: '',
      wallets: '',
      domains: '',
      platforms: 'DreadForum',
      language: 'English',
      timezone: 'UTC+00:00',
      first_seen: '2025-01-01',
      last_seen: '2026-03-01',
      risk_level: 'medium',
      notes: 'Synthetic demonstration record'
    });
    setShowActorModal(true);
  }

  // Footprint handlers
  async function handleSaveFootprint(e) {
    e.preventDefault();
    try {
      const payload = {
        ...fpFormData,
        associated_actors: fpFormData.associated_actors.split(',').map((s) => s.trim()).filter(Boolean)
      };
      await api.createFootprint(payload);
      notify('Digital footprint record created!');
      setShowFpModal(false);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function handleDeleteFootprint(fpid) {
    try {
      await api.deleteFootprint(fpid);
      notify(`Footprint ${fpid} deleted.`);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  // Relationship handlers
  async function handleSaveRelationship(e) {
    e.preventDefault();
    try {
      await api.createRelationship({
        ...relFormData,
        confidence: parseFloat(relFormData.confidence)
      });
      notify('Graph relationship linked!');
      setShowRelModal(false);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function handleDeleteRelationship(relId) {
    try {
      await api.deleteRelationship(relId);
      notify(`Relationship ${relId} unlinked.`);
      loadAllData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Synthetic Data Management Layer</span>
          </h1>
          <p className="text-xs text-slate-400">
            CRUD operations directly modify the database layer and immediately update scoring and graph topology.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-lg font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('actors')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeSubTab === 'actors' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Threat Actors ({actors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('footprints')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeSubTab === 'footprints' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Footprints ({footprints.length})
          </button>
          <button
            onClick={() => setActiveSubTab('relationships')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeSubTab === 'relationships' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Relationships ({relationships.length})
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border font-mono text-xs flex items-center space-x-2 ${
            statusMessage.error
              ? 'bg-red-950/80 border-red-800 text-red-300'
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
          }`}
        >
          {statusMessage.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab 1: Threat Actors Manager */}
      {activeSubTab === 'actors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openNewActor}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Synthetic Actor</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Primary Alias</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Wallets</th>
                    <th className="p-3">PGP Key</th>
                    <th className="p-3">Platforms</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {actors.map((a) => (
                    <tr key={a.actor_id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-cyan-400 font-bold">{a.actor_id}</td>
                      <td className="p-3 text-white font-bold">{a.primary_alias}</td>
                      <td className="p-3 uppercase text-[10px]">{a.risk_level}</td>
                      <td className="p-3 truncate max-w-[150px] text-emerald-400">
                        {a.wallets?.join(', ') || '—'}
                      </td>
                      <td className="p-3 truncate max-w-[150px] text-purple-300">
                        {a.pgp_fingerprints?.join(', ') || '—'}
                      </td>
                      <td className="p-3 truncate max-w-[150px] text-slate-400">
                        {a.platforms?.join(', ') || '—'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openEditActor(a)}
                          className="p-1 rounded hover:bg-slate-800 text-cyan-400"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActor(a.actor_id)}
                          className="p-1 rounded hover:bg-slate-800 text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Footprints Manager */}
      {activeSubTab === 'footprints' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowFpModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Digital Footprint</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Associated Target(s)</th>
                    <th className="p-3">Observed Platform</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {footprints.slice(0, 50).map((fp) => (
                    <tr key={fp.footprint_id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-cyan-400">{fp.footprint_id}</td>
                      <td className="p-3 uppercase text-[10px] text-slate-300 font-bold">{fp.type}</td>
                      <td className="p-3 truncate max-w-[280px] text-emerald-400">{fp.value}</td>
                      <td className="p-3 text-slate-300">{fp.associated_actors?.join(', ')}</td>
                      <td className="p-3 text-slate-400">{fp.platform || '—'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteFootprint(fp.footprint_id)}
                          className="p-1 rounded hover:bg-slate-800 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Relationships Manager */}
      {activeSubTab === 'relationships' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRelModal(true)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Link Relationship</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rel ID</th>
                    <th className="p-3">Source Node</th>
                    <th className="p-3">Relationship Type</th>
                    <th className="p-3">Target Node</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {relationships.slice(0, 50).map((r) => (
                    <tr key={r.rel_id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400">{r.rel_id}</td>
                      <td className="p-3 text-cyan-400 font-bold">{r.source}</td>
                      <td className="p-3 text-purple-400 font-semibold">{r.relationship}</td>
                      <td className="p-3 truncate max-w-[220px] text-slate-200">{r.target}</td>
                      <td className="p-3 text-emerald-400">{Math.round((r.confidence || 0.9) * 100)}%</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteRelationship(r.rel_id)}
                          className="p-1 rounded hover:bg-slate-800 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Actor */}
      {showActorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Edit Actor ${actorFormData.actor_id}` : 'Create New Synthetic Actor Record'}
              </h2>
              <button onClick={() => setShowActorModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveActor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Actor ID</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={actorFormData.actor_id}
                    onChange={(e) => setActorFormData({ ...actorFormData, actor_id: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Primary Alias</label>
                  <input
                    type="text"
                    required
                    value={actorFormData.primary_alias}
                    onChange={(e) => setActorFormData({ ...actorFormData, primary_alias: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={actorFormData.aliases}
                  onChange={(e) => setActorFormData({ ...actorFormData, aliases: e.target.value })}
                  placeholder="ShadowFox, S_Fox, shadow89"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Crypto Wallets (comma-separated)</label>
                  <input
                    type="text"
                    value={actorFormData.wallets}
                    onChange={(e) => setActorFormData({ ...actorFormData, wallets: e.target.value })}
                    placeholder="bc1qxy2..., 0x71C..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PGP Fingerprints (comma-separated)</label>
                  <input
                    type="text"
                    value={actorFormData.pgp_fingerprints}
                    onChange={(e) => setActorFormData({ ...actorFormData, pgp_fingerprints: e.target.value })}
                    placeholder="9B2A 78C1..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Emails (comma-separated)</label>
                  <input
                    type="text"
                    value={actorFormData.emails}
                    onChange={(e) => setActorFormData({ ...actorFormData, emails: e.target.value })}
                    placeholder="shadow@proton-mock.me"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Onion Domains (comma-separated)</label>
                  <input
                    type="text"
                    value={actorFormData.domains}
                    onChange={(e) => setActorFormData({ ...actorFormData, domains: e.target.value })}
                    placeholder="market.onion"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Platforms (comma-separated)</label>
                  <input
                    type="text"
                    value={actorFormData.platforms}
                    onChange={(e) => setActorFormData({ ...actorFormData, platforms: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Risk Level</label>
                  <select
                    value={actorFormData.risk_level}
                    onChange={(e) => setActorFormData({ ...actorFormData, risk_level: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Timezone</label>
                  <input
                    type="text"
                    value={actorFormData.timezone}
                    onChange={(e) => setActorFormData({ ...actorFormData, timezone: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Intelligence Notes</label>
                <textarea
                  rows="2"
                  value={actorFormData.notes}
                  onChange={(e) => setActorFormData({ ...actorFormData, notes: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowActorModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Footprint */}
      {showFpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white">Add Synthetic Digital Footprint</h2>
              <button onClick={() => setShowFpModal(false)} className="text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSaveFootprint} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Footprint Type</label>
                <select
                  value={fpFormData.type}
                  onChange={(e) => setFpFormData({ ...fpFormData, type: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                >
                  <option value="alias">Alias / Username</option>
                  <option value="wallet">Crypto Wallet</option>
                  <option value="pgp">PGP Key</option>
                  <option value="email">Email</option>
                  <option value="domain">Domain / Onion URL</option>
                  <option value="platform">Platform</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Value</label>
                <input
                  type="text"
                  required
                  value={fpFormData.value}
                  onChange={(e) => setFpFormData({ ...fpFormData, value: e.target.value })}
                  placeholder="e.g. bc1q... or ShadowFox"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Associated Actor ID(s) (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={fpFormData.associated_actors}
                  onChange={(e) => setFpFormData({ ...fpFormData, associated_actors: e.target.value })}
                  placeholder="ACT-001, ACT-002"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowFpModal(false)} className="px-3 py-1.5 bg-slate-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 rounded text-white font-bold">Add Footprint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Relationship */}
      {showRelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white">Create Graph Relationship</h2>
              <button onClick={() => setShowRelModal(false)} className="text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSaveRelationship} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Source Node</label>
                <input
                  type="text"
                  required
                  value={relFormData.source}
                  onChange={(e) => setRelFormData({ ...relFormData, source: e.target.value })}
                  placeholder="e.g. ACT-001"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Relationship Type</label>
                <select
                  value={relFormData.relationship}
                  onChange={(e) => setRelFormData({ ...relFormData, relationship: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                >
                  <option value="USES_WALLET">USES_WALLET</option>
                  <option value="USES_PGP">USES_PGP</option>
                  <option value="USES_ALIAS">USES_ALIAS</option>
                  <option value="OPERATES_DOMAIN">OPERATES_DOMAIN</option>
                  <option value="ACTIVE_ON">ACTIVE_ON</option>
                  <option value="SUSPECTED_SAME_ACTOR">SUSPECTED_SAME_ACTOR</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Node</label>
                <input
                  type="text"
                  required
                  value={relFormData.target}
                  onChange={(e) => setRelFormData({ ...relFormData, target: e.target.value })}
                  placeholder="e.g. bc1q... or ACT-002"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Evidence / Description</label>
                <input
                  type="text"
                  value={relFormData.evidence}
                  onChange={(e) => setRelFormData({ ...relFormData, evidence: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowRelModal(false)} className="px-3 py-1.5 bg-slate-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 rounded text-white font-bold">Link Edge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
