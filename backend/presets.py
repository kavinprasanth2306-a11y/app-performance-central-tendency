from typing import Dict, Any, List
import networkx as nx

def generate_presets_library() -> Dict[str, Dict[str, Any]]:
    presets = {}

    # 1. Zachary's Karate Club
    zkc = nx.karate_club_graph()
    zkc_edges = [[str(u), str(v)] for u, v in zkc.edges()]
    zkc_nodes = [{"id": str(n), "label": f"Member {n}", "club": zkc.nodes[n].get("club", "Unknown")} for n in zkc.nodes()]
    presets["karate_club"] = {
        "id": "karate_club",
        "name": "Zachary's Karate Club",
        "category": "Social Network",
        "description": "Legendary social network of 34 members in a university karate club observed by Wayne Zachary (1977). Ideal benchmark for link prediction and community split.",
        "nodes": zkc_nodes,
        "edges": zkc_edges,
        "node_count": len(zkc_nodes),
        "edge_count": len(zkc_edges)
    }

    # 2. Florentine Families Marriage Network
    ff = nx.florentine_families_graph()
    ff_edges = [[str(u), str(v)] for u, v in ff.edges()]
    ff_nodes = [{"id": str(n), "label": str(n)} for n in ff.nodes()]
    presets["florentine_families"] = {
        "id": "florentine_families",
        "name": "Florentine Families (15th Century)",
        "category": "Historical Alliance",
        "description": "Historical network of Renaissance Florentine families linked by matrimonial alliance. Illustrates the Medici centrality and prospective dynastic alliances.",
        "nodes": ff_nodes,
        "edges": ff_edges,
        "node_count": len(ff_nodes),
        "edge_count": len(ff_edges)
    }

    # 3. Krackhardt Kite Network
    kk = nx.krackhardt_kite_graph()
    labels = {
        0: "Andre", 1: "Beverly", 2: "Carol", 3: "Diane", 4: "Ed",
        5: "Fernando", 6: "Garth", 7: "Heather", 8: "Ike", 9: "Jane"
    }
    kk_edges = [[labels[u], labels[v]] for u, v in kk.edges()]
    kk_nodes = [{"id": labels[n], "label": labels[n]} for n in kk.nodes()]
    presets["krackhardt_kite"] = {
        "id": "krackhardt_kite",
        "name": "Krackhardt Kite Network",
        "category": "Organizational Social Circle",
        "description": "A classic 10-node network engineered by David Krackhardt to distinguish between degree centrality, closeness, and betweenness bridging.",
        "nodes": kk_nodes,
        "edges": kk_edges,
        "node_count": len(kk_nodes),
        "edge_count": len(kk_edges)
    }

    # 4. Academic Research Collaboration (Co-authorship Network)
    # A curated, realistic co-authorship collaboration subgraph
    collab_edges = [
        ["Dr. Alice", "Dr. Bob"], ["Dr. Alice", "Dr. Charlie"], ["Dr. Alice", "Dr. Diana"],
        ["Dr. Bob", "Dr. Charlie"], ["Dr. Bob", "Dr. Evan"], ["Dr. Charlie", "Dr. Diana"],
        ["Dr. Charlie", "Dr. Fiona"], ["Dr. Diana", "Dr. Fiona"], ["Dr. Evan", "Dr. George"],
        ["Dr. Evan", "Dr. Hannah"], ["Dr. Fiona", "Dr. George"], ["Dr. Fiona", "Dr. Ian"],
        ["Dr. George", "Dr. Hannah"], ["Dr. George", "Dr. Ian"], ["Dr. Hannah", "Dr. Julia"],
        ["Dr. Ian", "Dr. Julia"], ["Dr. Ian", "Dr. Kevin"], ["Dr. Julia", "Dr. Kevin"],
        ["Dr. Kevin", "Dr. Liam"], ["Dr. Liam", "Dr. Maya"], ["Dr. Liam", "Dr. Noah"],
        ["Dr. Maya", "Dr. Noah"], ["Dr. Maya", "Dr. Olivia"], ["Dr. Noah", "Dr. Olivia"],
        ["Dr. Bob", "Dr. Peter"], ["Dr. Peter", "Dr. Quinn"], ["Dr. Peter", "Dr. Rachel"],
        ["Dr. Quinn", "Dr. Rachel"], ["Dr. Rachel", "Dr. Sam"], ["Dr. Sam", "Dr. Tom"]
    ]
    collab_nodes_set = set()
    for u, v in collab_edges:
        collab_nodes_set.add(u)
        collab_nodes_set.add(v)
    collab_nodes = [{"id": n, "label": n} for n in sorted(list(collab_nodes_set))]
    presets["co_authorship"] = {
        "id": "co_authorship",
        "name": "Co-Authorship Network",
        "category": "Scientific Collaboration",
        "description": "Inter-institutional research co-authorship network showing distinct research clusters with cross-discipline candidates for new collaborative papers.",
        "nodes": collab_nodes,
        "edges": collab_edges,
        "node_count": len(collab_nodes),
        "edge_count": len(collab_edges)
    }

    # 5. Cyber Infrastructure Mesh
    infra_edges = [
        ["Router_Alpha", "Router_Beta"], ["Router_Alpha", "Router_Gamma"], ["Router_Alpha", "Switch_Core1"],
        ["Router_Beta", "Router_Delta"], ["Router_Beta", "Switch_Core1"], ["Router_Gamma", "Router_Delta"],
        ["Router_Gamma", "Switch_Core2"], ["Router_Delta", "Switch_Core2"], ["Switch_Core1", "Switch_Core2"],
        ["Switch_Core1", "Gateway_East"], ["Switch_Core2", "Gateway_West"], ["Gateway_East", "Server_Farm1"],
        ["Gateway_East", "Edge_Node1"], ["Gateway_West", "Server_Farm2"], ["Gateway_West", "Edge_Node2"],
        ["Server_Farm1", "Server_Farm2"], ["Edge_Node1", "Edge_Node2"], ["Edge_Node1", "Sensor_HubA"],
        ["Edge_Node2", "Sensor_HubB"], ["Sensor_HubA", "Sensor_HubB"]
    ]
    infra_nodes_set = set()
    for u, v in infra_edges:
        infra_nodes_set.add(u)
        infra_nodes_set.add(v)
    infra_nodes = [{"id": n, "label": n} for n in sorted(list(infra_nodes_set))]
    presets["cyber_infrastructure"] = {
        "id": "cyber_infrastructure",
        "name": "Cyber Infrastructure Mesh",
        "category": "Infrastructure & Telemetry",
        "description": "Multi-tier enterprise network mesh connecting edge gateways, core switches, and sensor hubs. Link prediction identifies optimal redundant links.",
        "nodes": infra_nodes,
        "edges": infra_edges,
        "node_count": len(infra_nodes),
        "edge_count": len(infra_edges)
    }

    return presets
