import io
import csv
import json
from typing import List, Dict, Any, Optional, Tuple
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx

from schemas import (
    GraphParseRequest,
    GraphParseResponse,
    GraphSummary,
    PairPredictionRequest,
    PairPredictionResponse,
    TopLinksRequest,
    TopLinksResponse,
    PresetMetadata
)
from algorithms import (
    build_graph_from_edges,
    get_graph_summary,
    compute_pair_heuristics,
    compute_top_predicted_links
)
from presets import generate_presets_library

app = FastAPI(
    title="Heuristic Link Predictor API",
    description="High-performance backend API for Graph Network Link Prediction using Common Neighbors, Jaccard, Adamic-Adar, Preferential Attachment, and Resource Allocation.",
    version="1.0.0"
)

# Enable CORS for local Vite development server and any frontend host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRESETS = generate_presets_library()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Heuristic Link Predictor API",
        "version": "1.0.0",
        "endpoints": [
            "/api/presets",
            "/api/presets/{preset_id}",
            "/api/graph/parse",
            "/api/predict/pair",
            "/api/predict/top-links",
            "/docs"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "heuristic-link-predictor"}

@app.get("/api/presets", response_model=List[PresetMetadata])
def list_presets():
    """Returns catalog of preloaded graph datasets."""
    return [
        PresetMetadata(
            id=p["id"],
            name=p["name"],
            description=p["description"],
            node_count=p["node_count"],
            edge_count=p["edge_count"],
            category=p["category"]
        )
        for p in PRESETS.values()
    ]

@app.get("/api/presets/{preset_id}")
def get_preset(preset_id: str):
    """Returns the full node and edge topology for a preset dataset."""
    if preset_id not in PRESETS:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found.")
    
    preset = PRESETS[preset_id]
    G = build_graph_from_edges(preset["edges"], [n["id"] for n in preset["nodes"]])
    summary = get_graph_summary(G)
    
    return {
        "id": preset["id"],
        "name": preset["name"],
        "description": preset["description"],
        "category": preset["category"],
        "summary": summary,
        "nodes": preset["nodes"],
        "edges": preset["edges"]
    }

def parse_raw_graph_content(raw_text: str, data_format: str = "csv") -> Tuple[List[Dict[str, Any]], List[List[str]]]:
    """Parses text content into nodes and edges lists."""
    edges = []
    nodes_set = set()
    cleaned = raw_text.strip()
    
    if not cleaned:
        return [], []
        
    # Check if JSON
    if data_format == "json" or cleaned.startswith("{") or cleaned.startswith("["):
        try:
            data = json.loads(cleaned)
            if isinstance(data, dict):
                # Standard node-link format
                if "edges" in data or "links" in data:
                    raw_edges = data.get("edges") or data.get("links", [])
                    for e in raw_edges:
                        if isinstance(e, dict):
                            src = str(e.get("source", e.get("u", "")))
                            tgt = str(e.get("target", e.get("v", "")))
                        elif isinstance(e, (list, tuple)) and len(e) >= 2:
                            src, tgt = str(e[0]), str(e[1])
                        else:
                            continue
                        if src and tgt:
                            edges.append([src, tgt])
                            nodes_set.add(src)
                            nodes_set.add(tgt)
                if "nodes" in data:
                    for n in data["nodes"]:
                        nid = str(n.get("id", n) if isinstance(n, dict) else n)
                        if nid:
                            nodes_set.add(nid)
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, (list, tuple)) and len(item) >= 2:
                        src, tgt = str(item[0]), str(item[1])
                        edges.append([src, tgt])
                        nodes_set.add(src)
                        nodes_set.add(tgt)
            nodes = [{"id": n, "label": n} for n in sorted(list(nodes_set))]
            return nodes, edges
        except Exception as e:
            # Fallback to delimited parsing
            pass

    # Delimited parsing (CSV, TSV, space-separated, edgelist)
    lines = cleaned.splitlines()
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue
            
        # Check header
        lower = line.lower()
        if "source" in lower and "target" in lower:
            continue
            
        # Detect delimiter
        if "," in line:
            parts = [p.strip() for p in line.split(",") if p.strip()]
        elif "\t" in line:
            parts = [p.strip() for p in line.split("\t") if p.strip()]
        else:
            parts = [p.strip() for p in line.split() if p.strip()]
            
        if len(parts) >= 2:
            src, tgt = parts[0], parts[1]
            edges.append([src, tgt])
            nodes_set.add(src)
            nodes_set.add(tgt)
        elif len(parts) == 1:
            # Isolated node declaration
            nodes_set.add(parts[0])

    nodes = [{"id": n, "label": n} for n in sorted(list(nodes_set))]
    return nodes, edges

@app.post("/api/graph/parse", response_model=GraphParseResponse)
def parse_graph_payload(request: GraphParseRequest):
    """Parses raw edge list or JSON text and returns structured graph summary."""
    if not request.raw_data:
        raise HTTPException(status_code=400, detail="Missing 'raw_data' in request body.")
        
    try:
        nodes, edges = parse_raw_graph_content(request.raw_data, request.data_format or "csv")
        node_ids = [n["id"] for n in nodes]
        G = build_graph_from_edges(edges, node_ids)
        summary = get_graph_summary(G)
        
        return GraphParseResponse(
            summary=GraphSummary(**summary),
            nodes=nodes,
            edges=[{"source": u, "target": v} for u, v in edges]
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse graph: {str(e)}")

@app.post("/api/graph/upload", response_model=GraphParseResponse)
async def upload_graph_file(file: UploadFile = File(...)):
    """Accepts uploaded CSV / TXT / JSON file and parses edge list."""
    try:
        content_bytes = await file.read()
        raw_text = content_bytes.decode("utf-8", errors="ignore")
        
        filename = file.filename.lower() if file.filename else ""
        fmt = "json" if filename.endswith(".json") else "csv"
        
        nodes, edges = parse_raw_graph_content(raw_text, fmt)
        node_ids = [n["id"] for n in nodes]
        G = build_graph_from_edges(edges, node_ids)
        summary = get_graph_summary(G)
        
        return GraphParseResponse(
            summary=GraphSummary(**summary),
            nodes=nodes,
            edges=[{"source": u, "target": v} for u, v in edges]
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process file upload: {str(e)}")

@app.post("/api/predict/pair", response_model=PairPredictionResponse)
def predict_pair(request: PairPredictionRequest):
    """Calculates all 5 heuristic link prediction metrics between two nodes."""
    if not request.node_a or not request.node_b:
        raise HTTPException(status_code=400, detail="Both 'node_a' and 'node_b' must be specified.")
        
    G = build_graph_from_edges(request.edges, request.nodes)
    response = compute_pair_heuristics(G, request.node_a, request.node_b)
    return response

@app.post("/api/predict/top-links", response_model=TopLinksResponse)
def predict_top_links(request: TopLinksRequest):
    """Ranks non-existing node pairs according to the selected heuristic metric."""
    G = build_graph_from_edges(request.edges, request.nodes)
    
    top_k = max(1, min(request.top_k or 10, 200))
    heuristic = request.heuristic or "adamic_adar"
    
    ranked_links, total_evaluated = compute_top_predicted_links(G, heuristic, top_k)
    
    return TopLinksResponse(
        heuristic=heuristic,
        total_non_edges_evaluated=total_evaluated,
        top_links=ranked_links
    )
