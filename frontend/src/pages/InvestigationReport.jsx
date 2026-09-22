import React, { useState, useEffect } from 'react';
import { FileText, Printer, Shield, CheckCircle, AlertTriangle, Calendar, Download } from 'lucide-react';
import { api } from '../services/api';

export default function InvestigationReport({ initialTargets }) {
  const [actors, setActors] = useState([]);
  const [targetA, setTargetA] = useState(initialTargets?.a || 'ACT-001');
  const [targetB, setTargetB] = useState(initialTargets?.b || 'ACT-002');
  const [caseId, setCaseId] = useState(`CASE-${new Date().getFullYear()}-SIH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [investigator, setInvestigator] = useState('Senior Cyber Intelligence Analyst');
  const [analystNotes, setAnalystNotes] = useState(
    'Identity correlation analysis indicates high-confidence convergence across primary cryptocurrency wallets and cryptographic PGP fingerprints. Recommend de-anonymization pivot toward synthetic hosting infrastructure.'
  );
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (initialTargets?.a) setTargetA(initialTargets.a);
    if (initialTargets?.b) setTargetB(initialTargets.b);
  }, [initialTargets]);

  useEffect(() => {
    if (targetA) {
      handleGenerate();
    }
  }, [targetA, targetB]);

  async function loadActors() {
    try {
      const data = await api.getActors();
      setActors(data);
    } catch (err) {
      console.error('Error fetching actors for report:', err);
    }
  }

  async function handleGenerate(e) {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.generateReport({
        case_id: caseId,
        actor_id_a: targetA,
        actor_id_b: targetB || null,
        investigator_name: investigator,
        analyst_notes: analystNotes
      });
      setReport(res);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden during print) */}
      <div className="print:hidden p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Investigation Case Dossier Generator</span>
            </h1>
            <p className="text-slate-400">Formal de-anonymization findings report for SIH academic demonstration</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-2 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-slate-400 block mb-1">Case Reference ID</label>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Primary Target A</label>
            <select
              value={targetA}
              onChange={(e) => setTargetA(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
            >
              {actors.map((a) => (
                <option key={a.actor_id} value={a.actor_id}>
                  {a.actor_id} — {a.primary_alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Correlated Target B (Optional)</label>
            <select
              value={targetB}
              onChange={(e) => setTargetB(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
            >
              <option value="">None (Single Target Dossier)</option>
              {actors.map((b) => (
                <option key={b.actor_id} value={b.actor_id}>
                  {b.actor_id} — {b.primary_alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white font-bold rounded transition-all"
            >
              Re-generate Report
            </button>
          </div>
        </form>

        <div>
          <label className="text-slate-400 block mb-1">Lead Analyst Intelligence Assessment</label>
          <textarea
            rows="2"
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100"
          ></textarea>
        </div>
      </div>

      {/* Printable Report Document */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 print:border-none print:bg-white print:text-black rounded-xl p-8 shadow-2xl space-y-6 font-mono text-xs">
          {/* Official Header */}
          <div className="border-b-2 border-cyan-500/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-cyan-400 print:text-black" />
                <span className="text-xl font-bold tracking-wider text-white print:text-black">
                  THREAT<span className="text-cyan-400 print:text-black">ASSIST</span> INTELLIGENCE DOSSIER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5">
                DARK WEB THREAT ACTOR DE-ANONYMIZATION & IDENTITY CORRELATION REPORT
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-cyan-400 print:text-black block">{report.case_id}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">Generated: {report.generated_at}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">Officer: {report.investigator}</span>
            </div>
          </div>

          {/* Academic Prototype Notice */}
          <div className="p-3 rounded bg-cyan-950/40 border border-cyan-800 print:border-gray-400 print:bg-gray-100 text-[10px] text-cyan-300 print:text-gray-800">
            <strong>CRITICAL MANDATORY NOTICE:</strong> {report.disclaimer}
          </div>

          {/* Target Identity Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Target */}
            <div className="p-4 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-300 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 print:text-black block">Target Identity A (Anchor)</span>
              <h3 className="text-base font-bold text-white print:text-black">{report.primary_target?.primary_alias}</h3>
              <p className="text-[11px] text-slate-400 print:text-gray-600">ID: {report.primary_target?.actor_id} | Risk: {report.primary_target?.risk_level?.toUpperCase()}</p>
              <div className="pt-2 border-t border-slate-800 print:border-gray-200 text-[11px] space-y-1">
                <div><strong>Wallets:</strong> {report.primary_target?.wallets?.join(', ') || 'None'}</div>
                <div><strong>PGP:</strong> {report.primary_target?.pgp_fingerprints?.join(', ') || 'None'}</div>
                <div><strong>Platforms:</strong> {report.primary_target?.platforms?.join(', ')}</div>
                <div><strong>Domains:</strong> {report.primary_target?.domains?.join(', ')}</div>
              </div>
            </div>

            {/* Secondary Target */}
            {report.secondary_target ? (
              <div className="p-4 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-300 space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-400 print:text-black block">Target Identity B (Correlated Candidate)</span>
                <h3 className="text-base font-bold text-white print:text-black">{report.secondary_target?.primary_alias}</h3>
                <p className="text-[11px] text-slate-400 print:text-gray-600">ID: {report.secondary_target?.actor_id} | Risk: {report.secondary_target?.risk_level?.toUpperCase()}</p>
                <div className="pt-2 border-t border-slate-800 print:border-gray-200 text-[11px] space-y-1">
                  <div><strong>Wallets:</strong> {report.secondary_target?.wallets?.join(', ') || 'None'}</div>
                  <div><strong>PGP:</strong> {report.secondary_target?.pgp_fingerprints?.join(', ') || 'None'}</div>
                  <div><strong>Platforms:</strong> {report.secondary_target?.platforms?.join(', ')}</div>
                  <div><strong>Domains:</strong> {report.secondary_target?.domains?.join(', ')}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 italic">
                Single entity profile analysis (no secondary comparison target selected).
              </div>
            )}
          </div>

          {/* Correlation Assessment (If 2 targets) */}
          {report.comparison_data && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-700 block mb-2">
                  De-anonymization Correlation Metrics
                </span>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 rounded bg-slate-900 print:bg-gray-100">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">HEURISTIC SCORE</span>
                    <span className="text-xl font-bold text-cyan-400 print:text-black">
                      {report.comparison_data.rule_based?.correlation_score}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 print:bg-gray-100">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">ML CLASSIFIER</span>
                    <span className="text-xl font-bold text-purple-400 print:text-black">
                      {report.comparison_data.ml_model?.ml_probability}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 print:bg-gray-100">
                    <span className="text-[10px] text-slate-400 print:text-gray-600 block">COMBINED CONFIDENCE</span>
                    <span className="text-xl font-bold text-emerald-400 print:text-black">
                      {report.comparison_data.combined_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-white print:text-black uppercase block">
                  Positive Evidentiary Indicators
                </span>
                <div className="space-y-1.5">
                  {report.comparison_data.rule_based?.supporting_factors?.map((f, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950 print:bg-gray-50 border border-emerald-900/60 print:border-gray-300 flex items-center space-x-2">
                      <span className="text-emerald-400 print:text-black font-bold">✓</span>
                      <span className="text-slate-200 print:text-gray-800">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counter-Evidence List */}
              {report.comparison_data.rule_based?.counter_evidence?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-white print:text-black uppercase block">
                    Counter-Evidence / Divergent Indicators
                  </span>
                  <div className="space-y-1.5">
                    {report.comparison_data.rule_based?.counter_evidence?.map((c, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950 print:bg-gray-50 border border-red-900/60 print:border-gray-300 flex items-center space-x-2">
                        <span className="text-red-400 print:text-black font-bold">✗</span>
                        <span className="text-slate-200 print:text-gray-800">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analyst Conclusion & Notes */}
          <div className="p-4 rounded-lg bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-300 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 print:text-black block">Intelligence Assessment & Action Plan</span>
            <p className="text-slate-300 print:text-gray-900 italic leading-relaxed">{report.analyst_notes}</p>
          </div>

          {/* Verification Signature Block */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex justify-between text-[10px] text-slate-500 print:text-gray-600">
            <div>
              <span>Official SIH Prototype Case Dossier</span>
              <span className="block">Status: Verified Academic Demonstration Record</span>
            </div>
            <div className="text-right">
              <span className="block border-b border-slate-700 print:border-black w-48 mb-1"></span>
              <span>Authorized Signature: {report.investigator}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
