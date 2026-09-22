import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, Shield, Key, Wallet, Mail, Globe, Users, Info } from 'lucide-react';
import { api } from '../services/api';

const NODE_COLORS = {
  actor: '#ef4444',
  alias: '#3b82f6',
  wallet: '#10b981',
  pgp: '#8b5cf6',
  email: '#f59e0b',
  domain: '#ec4899',
  platform: '#06b6d4',
  entity: '#6b7280'
};

export default function RelationshipGraph({ selectedActorId }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [actors, setActors] = useState([]);
  const [filterActor, setFilterActor] = useState(selectedActorId || 'ACT-001');
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState({ total_nodes: 0, total_edges: 0, connected_clusters: 0 });

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (selectedActorId) {
      setFilterActor(selectedActorId);
    }
  }, [selectedActorId]);

  useEffect(() => {
    loadGraphData();
  }, [filterActor]);

  async function loadActors() {
    try {
      const data = await api.getActors();
      setActors(data);
    } catch (err) {
      console.error('Error fetching actors for graph:', err);
    }
  }

  async function loadGraphData() {
    try {
      setLoading(true);
      const res = await api.getGraph(filterActor === 'all' ? null : filterActor);
      if (res && res.elements) {
        setStats(res.summary || { total_nodes: res.elements.nodes.length, total_edges: res.elements.edges.length });
        renderCytoscape(res.elements);
      }
    } catch (err) {
      console.error('Graph fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  function renderCytoscape(elements) {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...elements.nodes, ...elements.edges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-family': 'monospace',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-color': '#020617',
            'text-outline-width': 2,
            'width': (ele) => (ele.data('type') === 'actor' ? 38 : 24),
            'height': (ele) => (ele.data('type') === 'actor' ? 38 : 24),
            'border-width': 2,
            'border-color': '#0f172a',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#00f2fe',
            'shadow-blur': 15,
            'shadow-color': '#00f2fe',
            'shadow-opacity': 0.8
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#334155',
            'curve-style': 'bezier',
            'opacity': 0.7,
            'label': 'data(label)',
            'font-family': 'monospace',
            'font-size': '8px',
            'color': '#64748b',
            'text-rotation': 'autorotate',
            'text-margin-y': -6
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#00f2fe',
            'opacity': 1.0,
            'color': '#00f2fe'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 40,
        nodeRepulsion: 450000,
        idealEdgeLength: 80,
        edgeElasticity: 0.45
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        id: node.data('id'),
        label: node.data('label'),
        type: node.data('type'),
        color: node.data('color'),
        details: node.data('details'),
        degree: node.connectedEdges().length
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;
  }

  function handleZoomIn() {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  }

  function handleZoomOut() {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  }

  function handleFit() {
    if (cyRef.current) cyRef.current.fit(null, 30);
  }

  function handleReset() {
    if (cyRef.current) {
      cyRef.current.layout({ name: 'cose', animate: true, padding: 40 }).run();
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono">Digital Entity Relationship Graph</h1>
            <p className="text-xs text-slate-400">
              Interactive topological analysis of threat actors and shared digital entities
            </p>
          </div>
        </div>

        {/* Filter & View Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Scope:</span>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="bg-transparent text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Full Global Graph</option>
              {actors.map((a) => (
                <option key={a.actor_id} value={a.actor_id} className="bg-slate-900 text-white">
                  {a.primary_alias} ({a.actor_id})
                </option>
              ))}
            </select>
          </div>

          {/* Zoom & Fit Action Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-slate-800 text-slate-300" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-slate-800 text-slate-300" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleFit} className="p-1.5 rounded hover:bg-slate-800 text-slate-300" title="Fit to Screen">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleReset} className="p-1.5 rounded hover:bg-slate-800 text-slate-300" title="Reorganize Layout">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Overlay */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Cytoscape Canvas Container */}
        <div ref={containerRef} className="w-full h-[620px] bg-slate-950 cursor-grab active:cursor-grabbing" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono space-y-1.5 pointer-events-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entity Legend</span>
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="capitalize text-slate-300">{type}</span>
            </div>
          ))}
        </div>

        {/* Graph Quick Stats Pill */}
        <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-3">
          <span>Nodes: <strong className="text-white">{stats.total_nodes}</strong></span>
          <span>Edges: <strong className="text-white">{stats.total_edges}</strong></span>
          <span>Clusters: <strong className="text-cyan-400">{stats.connected_clusters}</strong></span>
        </div>

        {/* Selected Node Inspector Drawer (Right Side) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 p-4 rounded-xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-lg shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Entity</span>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{selectedNode.label}</h3>
                <span className="text-[10px] text-cyan-400 block capitalize">{selectedNode.type}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ENTITY ID</span>
                <span className="text-slate-300 break-all">{selectedNode.id}</span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">NETWORK DEGREE</span>
                <span className="text-cyan-400 font-bold">{selectedNode.degree} Connected Relationships</span>
              </div>

              {selectedNode.details && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block">PROPERTIES</span>
                  {Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="text-[11px] text-slate-300 truncate">
                      <strong className="text-slate-400">{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedNode.type === 'actor' && (
              <button
                onClick={() => setFilterActor(selectedNode.id)}
                className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-center transition-all"
              >
                Focus Actor Neighborhood
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
