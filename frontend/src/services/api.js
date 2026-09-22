const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
    return handleResponse(await fetch(`${API_BASE}/health`));
  },

  async getDashboard() {
    return handleResponse(await fetch(`${API_BASE}/dashboard`));
  },

  async getActors(search = '', risk = 'all') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (risk && risk !== 'all') params.append('risk', risk);
    return handleResponse(await fetch(`${API_BASE}/actors?${params.toString()}`));
  },

  async getActor(id) {
    return handleResponse(await fetch(`${API_BASE}/actors/${id}`));
  },

  async createActor(actorData) {
    return handleResponse(await fetch(`${API_BASE}/actors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorData)
    }));
  },

  async updateActor(id, updateData) {
    return handleResponse(await fetch(`${API_BASE}/actors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    }));
  },

  async deleteActor(id) {
    return handleResponse(await fetch(`${API_BASE}/actors/${id}`, {
      method: 'DELETE'
    }));
  },

  async getFootprints(type = 'all', search = '') {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (search) params.append('search', search);
    return handleResponse(await fetch(`${API_BASE}/footprints?${params.toString()}`));
  },

  async createFootprint(fpData) {
    return handleResponse(await fetch(`${API_BASE}/footprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fpData)
    }));
  },

  async deleteFootprint(id) {
    return handleResponse(await fetch(`${API_BASE}/footprints/${id}`, {
      method: 'DELETE'
    }));
  },

  async getRelationships() {
    return handleResponse(await fetch(`${API_BASE}/relationships`));
  },

  async createRelationship(relData) {
    return handleResponse(await fetch(`${API_BASE}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relData)
    }));
  },

  async deleteRelationship(id) {
    return handleResponse(await fetch(`${API_BASE}/relationships/${id}`, {
      method: 'DELETE'
    }));
  },

  async compareIdentities(actorIdA, actorIdB, weights = null) {
    return handleResponse(await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_id_a: actorIdA,
        actor_id_b: actorIdB,
        weights: weights
      })
    }));
  },

  async quickMatch(query) {
    return handleResponse(await fetch(`${API_BASE}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }));
  },

  async getGraph(actorId = null) {
    const url = actorId ? `${API_BASE}/graph?actor_id=${actorId}` : `${API_BASE}/graph`;
    return handleResponse(await fetch(url));
  },

  async generateReport(reportPayload) {
    return handleResponse(await fetch(`${API_BASE}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload)
    }));
  }
};
