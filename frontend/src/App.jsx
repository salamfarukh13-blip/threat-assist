import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ActorDatabase from './pages/ActorDatabase';
import IdentityComparison from './pages/IdentityComparison';
import RelationshipGraph from './pages/RelationshipGraph';
import DataManagement from './pages/DataManagement';
import InvestigationReport from './pages/InvestigationReport';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [comparePair, setComparePair] = useState({ a: 'ACT-001', b: 'ACT-002' });
  const [graphActor, setGraphActor] = useState('ACT-001');
  const [reportTargets, setReportTargets] = useState({ a: 'ACT-001', b: 'ACT-002' });

  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      setIsRetrying(true);
      const res = await api.getHealth();
      setHealth(res);
    } catch (err) {
      console.warn('Backend connection:', err.message);
      setHealth({ status: 'offline', active_database: 'Disconnected', error: err.message });
    } finally {
      setIsRetrying(false);
    }
  }

  function handleSelectPairForCompare(idA, idB) {
    setComparePair({ a: idA, b: idB });
  }

  function handleSelectActorForGraph(actorId) {
    setGraphActor(actorId);
  }

  function handleGenerateReportFromPair(idA, idB) {
    setReportTargets({ a: idA, b: idB });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {health?.status === 'offline' && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start sm:items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">Backend API Connecting or Inactive</p>
                <p className="text-amber-200/80 mt-0.5">
                  If hosted on Render free tier, spin-up from sleep takes ~45s on first visit. Ensure your <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-300">VITE_API_URL</code> environment variable points to your live backend.
                </p>
              </div>
            </div>
            <button
              onClick={checkBackendHealth}
              disabled={isRetrying}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-all shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
            </button>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectPairForCompare={handleSelectPairForCompare}
          />
        )}

        {activeTab === 'actors' && (
          <ActorDatabase
            setActiveTab={setActiveTab}
            onSelectPairForCompare={handleSelectPairForCompare}
            onSelectActorForGraph={handleSelectActorForGraph}
          />
        )}

        {activeTab === 'compare' && (
          <IdentityComparison
            initialPair={comparePair}
            setActiveTab={setActiveTab}
            onGenerateReportFromPair={handleGenerateReportFromPair}
          />
        )}

        {activeTab === 'graph' && (
          <RelationshipGraph selectedActorId={graphActor} />
        )}

        {activeTab === 'management' && (
          <DataManagement />
        )}

        {activeTab === 'report' && (
          <InvestigationReport initialTargets={reportTargets} />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 font-mono text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THREAT ASSIST v1.0.0 — Dark Web Threat Intelligence Platform</span>
          <span className="text-cyan-400/80">100% Synthetic Local Data • No Live Dark Web Scraping</span>
        </div>
      </footer>
    </div>
  );
}
