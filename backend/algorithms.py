import math
from typing import Dict, List, Tuple, Any, Optional
import networkx as nx
from schemas import PairPredictionResponse, CommonNeighborDetail, PredictedLink

def build_graph_from_edges(edges: List[List[Any]], nodes: Optional[List[str]] = None) -> nx.Graph:
    """Builds an undirected NetworkX graph from a list of edge pairs or tuples."""
    G = nx.Graph()
    if nodes:
        for n in nodes:
            G.add_node(str(n))
    for edge in edges:
        if len(edge) >= 2:
            u, v = str(edge[0]), str(edge[1])
            w = float(edge[2]) if len(edge) > 2 and edge[2] is not None else 1.0
            G.add_edge(u, v, weight=w)
    return G

def get_graph_summary(G: nx.Graph) -> Dict[str, Any]:
    """Computes comprehensive structural network metrics."""
    n_nodes = G.number_of_nodes()
    n_edges = G.number_of_edges()
    
    if n_nodes == 0:
        return {
            "node_count": 0,
            "edge_count": 0,
            "density": 0.0,
            "average_degree": 0.0,
            "is_connected": False,
            "number_connected_components": 0,
            "clustering_coefficient": 0.0,
            "isolated_nodes_count": 0
        }

    density = nx.density(G)
    degrees = [d for _, d in G.degree()]
    avg_degree = sum(degrees) / n_nodes if n_nodes > 0 else 0.0
    isolated_nodes_count = sum(1 for d in degrees if d == 0)
    
    try:
        is_conn = nx.is_connected(G)
        num_cc = nx.number_connected_components(G)
    except Exception:
        is_conn = False
        num_cc = 1
        
    try:
        clustering = nx.average_clustering(G)
    except Exception:
        clustering = 0.0
        
    return {
        "node_count": n_nodes,
        "edge_count": n_edges,
        "density": round(float(density), 5),
        "average_degree": round(float(avg_degree), 3),
        "is_connected": is_conn,
        "number_connected_components": num_cc,
        "clustering_coefficient": round(float(clustering), 4),
        "isolated_nodes_count": isolated_nodes_count
    }

def compute_pair_heuristics(G: nx.Graph, u: str, v: str) -> PairPredictionResponse:
    """Computes all 5 heuristic link prediction metrics between node u and node v."""
    u, v = str(u), str(v)
    
    # Ensure both nodes exist in the graph
    if not G.has_node(u):
        G.add_node(u)
    if not G.has_node(v):
        G.add_node(v)
        
    deg_u = G.degree(u)
    deg_v = G.degree(v)
    is_existing = G.has_edge(u, v)
    
    # Neighbors sets
    nbrs_u = set(G.neighbors(u))
    nbrs_v = set(G.neighbors(v))
    
    common_nbrs = sorted(list(nbrs_u.intersection(nbrs_v)))
    union_nbrs = nbrs_u.union(nbrs_v)
    
    cn_count = len(common_nbrs)
    union_count = len(union_nbrs)
    
    # Jaccard Coefficient
    jc = (cn_count / union_count) if union_count > 0 else 0.0
    
    # Preferential Attachment
    pa = deg_u * deg_v
    
    # Adamic-Adar & Resource Allocation with individual contribution breakdown
    aa = 0.0
    ra = 0.0
    details: List[CommonNeighborDetail] = []
    
    for w in common_nbrs:
        deg_w = G.degree(w)
        # AA: 1 / log(k). If deg_w <= 1, log(1) == 0, so contribution is 0
        if deg_w > 1:
            aa_c = 1.0 / math.log(deg_w)
        else:
            aa_c = 0.0
            
        # RA: 1 / k. If deg_w == 0, contribution is 0
        if deg_w > 0:
            ra_c = 1.0 / deg_w
        else:
            ra_c = 0.0
            
        aa += aa_c
        ra += ra_c
        
        details.append(CommonNeighborDetail(
            node=w,
            degree=deg_w,
            aa_contribution=round(aa_c, 5),
            ra_contribution=round(ra_c, 5)
        ))
        
    # Shortest path distance
    shortest_path = None
    try:
        shortest_path = nx.shortest_path_length(G, source=u, target=v)
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        shortest_path = None

    return PairPredictionResponse(
        node_a=u,
        node_b=v,
        degree_a=deg_u,
        degree_b=deg_v,
        is_existing_edge=is_existing,
        shortest_path_distance=shortest_path,
        common_neighbors_count=cn_count,
        common_neighbors_list=common_nbrs,
        common_neighbors_details=details,
        union_neighbors_count=union_count,
        jaccard_coefficient=round(float(jc), 5),
        adamic_adar_index=round(float(aa), 5),
        preferential_attachment=pa,
        resource_allocation_index=round(float(ra), 5)
    )

def compute_top_predicted_links(
    G: nx.Graph, 
    heuristic: str = "adamic_adar", 
    top_k: int = 10
) -> Tuple[List[PredictedLink], int]:
    """
    Computes heuristic scores for all non-existing edges in the graph
    and returns the top K ranked pairs.
    """
    nodes = sorted(list(G.nodes()))
    n = len(nodes)
    if n < 2:
        return [], 0

    non_edges = list(nx.non_edges(G))
    total_non_edges = len(non_edges)
    
    results = []
    
    for u, v in non_edges:
        nbrs_u = set(G.neighbors(u))
        nbrs_v = set(G.neighbors(v))
        common_nbrs = nbrs_u.intersection(nbrs_v)
        union_nbrs = nbrs_u.union(nbrs_v)
        
        cn = len(common_nbrs)
        un = len(union_nbrs)
        jc = (cn / un) if un > 0 else 0.0
        deg_u = G.degree(u)
        deg_v = G.degree(v)
        pa = deg_u * deg_v
        
        aa = 0.0
        ra = 0.0
        for w in common_nbrs:
            deg_w = G.degree(w)
            if deg_w > 1:
                aa += 1.0 / math.log(deg_w)
            if deg_w > 0:
                ra += 1.0 / deg_w
                
        # Primary score based on heuristic
        heuristic_clean = heuristic.lower().replace("-", "_")
        if heuristic_clean in ["cn", "common_neighbors"]:
            score = float(cn)
        elif heuristic_clean in ["jc", "jaccard", "jaccard_coefficient"]:
            score = float(jc)
        elif heuristic_clean in ["pa", "preferential_attachment"]:
            score = float(pa)
        elif heuristic_clean in ["ra", "resource_allocation", "resource_allocation_index"]:
            score = float(ra)
        else: # default adamic_adar
            score = float(aa)
            
        results.append({
            "node_a": u,
            "node_b": v,
            "score": score,
            "common_neighbors": cn,
            "jaccard": round(float(jc), 4),
            "adamic_adar": round(float(aa), 4),
            "preferential_attachment": pa,
            "resource_allocation": round(float(ra), 4)
        })
        
    # Sort descending by score, tiebreak with Adamic-Adar then Common Neighbors
    results.sort(key=lambda x: (x["score"], x["adamic_adar"], x["common_neighbors"]), reverse=True)
    
    top_results = results[:top_k]
    ranked_links = [
        PredictedLink(
            rank=i + 1,
            node_a=item["node_a"],
            node_b=item["node_b"],
            score=round(item["score"], 4),
            common_neighbors=item["common_neighbors"],
            jaccard=item["jaccard"],
            adamic_adar=item["adamic_adar"],
            preferential_attachment=item["preferential_attachment"],
            resource_allocation=item["resource_allocation"]
        )
        for i, item in enumerate(top_results)
    ]
    
    return ranked_links, total_non_edges
