from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EdgeItem(BaseModel):
    source: str
    target: str
    weight: Optional[float] = 1.0

class GraphParseRequest(BaseModel):
    raw_data: Optional[str] = None
    data_format: Optional[str] = "csv" # "csv", "tsv", "json", "edgelist"
    delimiter: Optional[str] = None

class CommonNeighborDetail(BaseModel):
    node: str
    degree: int
    aa_contribution: float
    ra_contribution: float

class PairPredictionRequest(BaseModel):
    edges: List[List[Any]]
    node_a: str
    node_b: str
    nodes: Optional[List[str]] = None

class PairPredictionResponse(BaseModel):
    node_a: str
    node_b: str
    degree_a: int
    degree_b: int
    is_existing_edge: bool
    shortest_path_distance: Optional[int] = None
    common_neighbors_count: int
    common_neighbors_list: List[str]
    common_neighbors_details: List[CommonNeighborDetail]
    union_neighbors_count: int
    jaccard_coefficient: float
    adamic_adar_index: float
    preferential_attachment: int
    resource_allocation_index: float

class TopLinksRequest(BaseModel):
    edges: List[List[Any]]
    heuristic: Optional[str] = "adamic_adar"  # common_neighbors, jaccard, adamic_adar, preferential_attachment, resource_allocation
    top_k: Optional[int] = 10
    nodes: Optional[List[str]] = None

class PredictedLink(BaseModel):
    rank: int
    node_a: str
    node_b: str
    score: float
    common_neighbors: int
    jaccard: float
    adamic_adar: float
    preferential_attachment: int
    resource_allocation: float

class TopLinksResponse(BaseModel):
    heuristic: str
    total_non_edges_evaluated: int
    top_links: List[PredictedLink]

class GraphSummary(BaseModel):
    node_count: int
    edge_count: int
    density: float
    average_degree: float
    is_connected: bool
    number_connected_components: int
    clustering_coefficient: float
    isolated_nodes_count: int

class GraphParseResponse(BaseModel):
    summary: GraphSummary
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class PresetMetadata(BaseModel):
    id: str
    name: str
    description: str
    node_count: int
    edge_count: int
    category: str
