import logging
import networkx as nx
from typing import Dict, Any, List, Optional

logger = logging.getLogger("threat_assist.graph")

NODE_COLORS = {
    "actor": "#ef4444",       # Red
    "alias": "#3b82f6",       # Blue
    "wallet": "#10b981",      # Emerald Green
    "pgp": "#8b5cf6",         # Purple
    "email": "#f59e0b",       # Amber
    "domain": "#ec4899",      # Pink
    "platform": "#06b6d4",    # Cyan
    "unknown": "#6b7280"      # Gray
}

class IdentityGraphAnalytics:
    def __init__(self):
        self.graph = nx.Graph()

    def build_graph(self, actors: List[Dict[str, Any]], relationships: List[Dict[str, Any]] = None):
        self.graph.clear()
        
        # Add actors as central nodes
        for a in actors:
            aid = a["actor_id"]
            self.graph.add_node(aid, 
                id=aid, 
                label=f"{a['primary_alias']} ({aid})", 
                type="actor", 
                risk=a.get("risk_level", "medium"),
                color=NODE_COLORS["actor"],
                details={
                    "primary_alias": a["primary_alias"],
                    "risk_level": a.get("risk_level", "medium"),
                    "timezone": a.get("timezone", ""),
                    "platforms": a.get("platforms", [])
                }
            )

            # Add footprints directly associated
            for alias in a.get("aliases", []):
                node_id = f"alias:{alias}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=alias, type="alias", color=NODE_COLORS["alias"], details={"value": alias})
                self.graph.add_edge(aid, node_id, relationship="USES_ALIAS", confidence=0.98)

            for wallet in a.get("wallets", []):
                node_id = f"wallet:{wallet}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=wallet[:14] + "...", type="wallet", color=NODE_COLORS["wallet"], details={"full_address": wallet})
                self.graph.add_edge(aid, node_id, relationship="USES_WALLET", confidence=0.95)

            for pgp in a.get("pgp_fingerprints", []):
                node_id = f"pgp:{pgp}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=pgp[:12] + "...", type="pgp", color=NODE_COLORS["pgp"], details={"fingerprint": pgp})
                self.graph.add_edge(aid, node_id, relationship="USES_PGP", confidence=0.99)

            for email in a.get("emails", []):
                node_id = f"email:{email}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=email, type="email", color=NODE_COLORS["email"], details={"address": email})
                self.graph.add_edge(aid, node_id, relationship="USES_EMAIL", confidence=0.90)

            for dom in a.get("domains", []):
                node_id = f"domain:{dom}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=dom, type="domain", color=NODE_COLORS["domain"], details={"domain": dom})
                self.graph.add_edge(aid, node_id, relationship="OPERATES_DOMAIN", confidence=0.85)

            for plat in a.get("platforms", []):
                node_id = f"platform:{plat}"
                if not self.graph.has_node(node_id):
                    self.graph.add_node(node_id, id=node_id, label=plat, type="platform", color=NODE_COLORS["platform"], details={"platform_name": plat})
                self.graph.add_edge(aid, node_id, relationship="ACTIVE_ON", confidence=0.80)

        # Add explicit relationships if any
        if relationships:
            for r in relationships:
                src = r.get("source")
                tgt = r.get("target")
                rel = r.get("relationship", "CONNECTED_TO")
                conf = r.get("confidence", 0.9)
                
                # Check if src and tgt are nodes or prefix them
                if not self.graph.has_node(src):
                    self.graph.add_node(src, id=src, label=src, type="entity", color=NODE_COLORS["unknown"])
                if not self.graph.has_node(tgt):
                    self.graph.add_node(tgt, id=tgt, label=tgt, type="entity", color=NODE_COLORS["unknown"])
                self.graph.add_edge(src, tgt, relationship=rel, confidence=conf, evidence=r.get("evidence", ""))

    def to_cytoscape_elements(self, filter_actor: Optional[str] = None) -> Dict[str, Any]:
        """Convert NetworkX graph into elements for frontend visualization."""
        if filter_actor and self.graph.has_node(filter_actor):
            # 2 degrees of separation neighborhood
            nodes_to_include = set()
            nodes_to_include.add(filter_actor)
            neighbors_1 = set(self.graph.neighbors(filter_actor))
            nodes_to_include.update(neighbors_1)
            for n1 in neighbors_1:
                nodes_to_include.update(self.graph.neighbors(n1))
            subgraph = self.graph.subgraph(nodes_to_include)
        else:
            subgraph = self.graph

        nodes = []
        edges = []

        # Degree centralities
        degrees = dict(subgraph.degree())

        for node, data in subgraph.nodes(data=True):
            nodes.append({
                "data": {
                    "id": str(node),
                    "label": data.get("label", str(node)),
                    "type": data.get("type", "entity"),
                    "color": data.get("color", "#6b7280"),
                    "degree": degrees.get(node, 1),
                    "details": data.get("details", {})
                }
            })

        for u, v, data in subgraph.edges(data=True):
            edges.append({
                "data": {
                    "id": f"{u}->{v}",
                    "source": str(u),
                    "target": str(v),
                    "label": data.get("relationship", "RELATED_TO"),
                    "confidence": data.get("confidence", 0.8),
                    "evidence": data.get("evidence", "")
                }
            })

        # Calculate graph statistics
        num_components = nx.number_connected_components(subgraph) if len(subgraph) > 0 else 0
        
        return {
            "elements": {
                "nodes": nodes,
                "edges": edges
            },
            "summary": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "connected_clusters": num_components
            }
        }

    def find_path_between_actors(self, actor_a: str, actor_b: str) -> List[Dict[str, Any]]:
        if not self.graph.has_node(actor_a) or not self.graph.has_node(actor_b):
            return []
        try:
            path = nx.shortest_path(self.graph, source=actor_a, target=actor_b)
            path_details = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_data = self.graph.get_edge_data(u, v) or {}
                node_u = self.graph.nodes[u]
                node_v = self.graph.nodes[v]
                path_details.append({
                    "from_node": {"id": u, "label": node_u.get("label", u), "type": node_u.get("type")},
                    "to_node": {"id": v, "label": node_v.get("label", v), "type": node_v.get("type")},
                    "relationship": edge_data.get("relationship", "CONNECTED_TO"),
                    "confidence": edge_data.get("confidence", 0.9)
                })
            return path_details
        except nx.NetworkXNoPath:
            return []

graph_analytics = IdentityGraphAnalytics()
