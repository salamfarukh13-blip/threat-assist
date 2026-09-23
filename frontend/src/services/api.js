import { mockService } from './mockService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 6000);
      return await handleResponse(res);
    } catch (err) {
      console.info('Backend unreachable, using standalone client-side engine.');
      return mockService.getHealth();
    }
  },

  async getDashboard() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/dashboard`);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getDashboard();
    }
  },

  async getActors(search = '', risk = 'all') {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (risk && risk !== 'all') params.append('risk', risk);
      const res = await fetchWithTimeout(`${API_BASE}/actors?${params.toString()}`);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getActors(search, risk);
    }
  },

  async getActor(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/actors/${id}`);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getActor(id);
    }
  },

  async createActor(actorData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/actors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.createActor(actorData);
    }
  },

  async updateActor(id, updateData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/actors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.updateActor(id, updateData);
    }
  },

  async deleteActor(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/actors/${id}`, {
        method: 'DELETE'
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.deleteActor(id);
    }
  },

  async getFootprints(type = 'all', search = '') {
    try {
      const params = new URLSearchParams();
      if (type && type !== 'all') params.append('type', type);
      if (search) params.append('search', search);
      const res = await fetchWithTimeout(`${API_BASE}/footprints?${params.toString()}`);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getFootprints(type, search);
    }
  },

  async createFootprint(fpData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/footprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fpData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.createFootprint(fpData);
    }
  },

  async deleteFootprint(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/footprints/${id}`, {
        method: 'DELETE'
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.deleteFootprint(id);
    }
  },

  async getRelationships() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/relationships`);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getRelationships();
    }
  },

  async createRelationship(relData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.createRelationship(relData);
    }
  },

  async deleteRelationship(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/relationships/${id}`, {
        method: 'DELETE'
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.deleteRelationship(id);
    }
  },

  async compareIdentities(actorIdA, actorIdB, weights = null) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor_id_a: actorIdA,
          actor_id_b: actorIdB,
          weights: weights
        })
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.compareIdentities(actorIdA, actorIdB, weights);
    }
  },

  async quickMatch(query) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.quickMatch(query);
    }
  },

  async getGraph(actorId = null) {
    try {
      const url = actorId ? `${API_BASE}/graph?actor_id=${actorId}` : `${API_BASE}/graph`;
      const res = await fetchWithTimeout(url);
      return await handleResponse(res);
    } catch (err) {
      return mockService.getGraph(actorId);
    }
  },

  async generateReport(reportPayload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockService.generateReport(reportPayload);
    }
  }
};
