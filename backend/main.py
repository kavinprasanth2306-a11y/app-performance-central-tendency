import io
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import pandas as pd
import numpy as np

from schemas import (
    MetricSummary,
    DistributionResponse,
    TimeSeriesResponse,
    Recommendation,
    CustomAnalysisRequest,
    FilterOptions,
    PaginatedDataResponse
)
from sample_data import load_initial_dataset, generate_rich_telemetry
from stats_engine import (
    get_metric_summary,
    compute_distribution_response,
    compute_time_series,
    generate_system_recommendations,
    compute_central_tendency,
    compute_dispersion,
    compute_outliers
)

app = FastAPI(
    title="App Performance Central Tendency Analytics API",
    description="Statistical Analysis Engine for Web & Mobile App Telemetry using Measures of Central Tendency & Dispersion",
    version="2.0.0"
)

# Enable CORS for local dev and frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory dataset store
class DataStore:
    def __init__(self):
        self.df = load_initial_dataset()
        self.dataset_name = "Application Telemetry Dataset (Multi-Tier & Device Benchmark)"
        self.last_updated = "Initial Load"

store = DataStore()


def get_numeric_columns(df: pd.DataFrame) -> List[str]:
    return [col for col in df.select_dtypes(include=[np.number]).columns.tolist() if not col.endswith("_id")]


def get_categorical_columns(df: pd.DataFrame) -> List[str]:
    return [col for col in df.select_dtypes(exclude=[np.number]).columns.tolist()]


def apply_filters(
    df: pd.DataFrame,
    configuration: Optional[str] = None,
    device_model: Optional[str] = None,
    os_version: Optional[str] = None,
    network_type: Optional[str] = None
) -> pd.DataFrame:
    filtered = df.copy()
    if configuration and configuration != "All" and "Configuration" in filtered.columns:
        filtered = filtered[filtered["Configuration"] == configuration]
    if device_model and device_model != "All" and "Device_Model" in filtered.columns:
        filtered = filtered[filtered["Device_Model"] == device_model]
    if os_version and os_version != "All" and "OS_Version" in filtered.columns:
        filtered = filtered[filtered["OS_Version"] == os_version]
    if network_type and network_type != "All" and "Network_Type" in filtered.columns:
        filtered = filtered[filtered["Network_Type"] == network_type]
    return filtered


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_name": store.dataset_name,
        "rows": len(store.df),
        "columns": store.df.columns.tolist(),
        "numeric_metrics": get_numeric_columns(store.df)
    }


@app.get("/api/filters", response_model=FilterOptions)
def get_filter_options():
    df = store.df
    configs = sorted(df["Configuration"].dropna().unique().tolist()) if "Configuration" in df.columns else []
    devices = sorted(df["Device_Model"].dropna().unique().tolist()) if "Device_Model" in df.columns else []
    os_vers = sorted(df["OS_Version"].dropna().unique().tolist()) if "OS_Version" in df.columns else []
    networks = sorted(df["Network_Type"].dropna().unique().tolist()) if "Network_Type" in df.columns else []
    numeric_cols = get_numeric_columns(df)
    
    return FilterOptions(
        configurations=["All"] + configs if configs else ["All"],
        device_models=["All"] + devices if devices else ["All"],
        os_versions=["All"] + os_vers if os_vers else ["All"],
        network_types=["All"] + networks if networks else ["All"],
        metrics=numeric_cols,
        total_records=len(df)
    )


@app.get("/api/presets")
def get_presets():
    return [
        {
            "id": "production_telemetry",
            "name": "Production Multi-Tier & Mobile App Telemetry (1,200 records)",
            "description": "Comprehensive production dataset featuring iPhone/Galaxy/Pixel devices, 5G/4G/WiFi network tiers, cold start latency, FPS drops, and memory usage.",
            "metrics": ["Response_Time_ms", "CPU_Utilization_pct", "Memory_Usage_MB", "Throughput_RPS", "App_Launch_Time_ms", "FPS_Drop_Rate"]
        },
        {
            "id": "monolith_vs_microservices",
            "name": "Monolith vs Microservices vs Redis Cache Benchmark (500 records)",
            "description": "Original synthetic benchmark comparing legacy monolithic server latency against uncached and cached microservice tiers.",
            "metrics": ["Response_Time_ms", "CPU_Utilization_pct", "Memory_Usage_MB", "Throughput_RPS"]
        },
        {
            "id": "heavy_tail_stress",
            "name": "Severe Tail-Latency & Memory Leak Stress Test (800 records)",
            "description": "High outlier dataset simulating garbage collection stalls and database deadlocks with severe positive skewness (Mean >> Median).",
            "metrics": ["Response_Time_ms", "CPU_Utilization_pct", "Memory_Usage_MB", "FPS_Drop_Rate"]
        }
    ]


@app.post("/api/presets/load/{preset_id}")
def load_preset(preset_id: str):
    if preset_id == "production_telemetry":
        store.df = generate_rich_telemetry(num_samples=1200, seed=42)
        store.dataset_name = "Production Multi-Tier & Mobile App Telemetry"
    elif preset_id == "monolith_vs_microservices":
        # Load from root CSV or generate 3-tier
        store.df = load_initial_dataset()
        store.dataset_name = "Monolith vs Microservices vs Redis Benchmark"
    elif preset_id == "heavy_tail_stress":
        np.random.seed(99)
        # Heavy tail distribution with extreme outliers
        n = 800
        rt_normal = np.random.normal(90, 15, int(n * 0.82))
        rt_outliers = np.random.exponential(450, int(n * 0.18)) + 300
        rt = np.round(np.concatenate([rt_normal, rt_outliers]), 1)
        
        cpu = np.round(np.clip(np.random.normal(82, 10, n), 20, 100), 1)
        mem = np.round(np.linspace(600, 1950, n) + np.random.normal(0, 30, n), 0) # Memory leak simulation
        tput = np.round(np.clip(np.random.normal(320, 40, n), 40, 600), 0)
        launch = np.round(np.random.normal(1800, 350, n), 0)
        fps_drop = np.round(np.clip(np.random.exponential(8.5, n), 0, 45), 2)
        
        cfgs = np.random.choice(["Config_A_Monolith", "Config_B_Micro_Uncached", "Config_C_Micro_Cached"], size=n, p=[0.5, 0.35, 0.15])
        devs = np.random.choice(["iPhone 15 Pro", "Samsung Galaxy S24", "Legacy Test Device"], size=n, p=[0.3, 0.4, 0.3])
        os_v = ["Android 11" if d == "Legacy Test Device" else ("iOS 18" if d == "iPhone 15 Pro" else "Android 14") for d in devs]
        nets = np.random.choice(["3G_Poor", "4G_LTE", "5G"], size=n, p=[0.3, 0.5, 0.2])
        
        store.df = pd.DataFrame({
            "Record_ID": [f"STRESS-{1000+i}" for i in range(n)],
            "Response_Time_ms": rt,
            "CPU_Utilization_pct": cpu,
            "Memory_Usage_MB": mem,
            "Throughput_RPS": tput,
            "App_Launch_Time_ms": launch,
            "FPS_Drop_Rate": fps_drop,
            "Configuration": cfgs,
            "Device_Model": devs,
            "OS_Version": os_v,
            "Network_Type": nets
        })
        store.dataset_name = "Heavy Tail Latency & Memory Leak Stress Test"
    else:
        raise HTTPException(status_code=400, detail="Unknown preset ID")
        
    return {
        "success": True,
        "message": f"Successfully loaded preset: {store.dataset_name}",
        "rows": len(store.df),
        "columns": store.df.columns.tolist()
    }


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Parses and validates uploaded CSV/TSV/JSON performance logs.
    """
    try:
        contents = await file.read()
        filename = file.filename.lower() if file.filename else "dataset.csv"
        
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".tsv"):
            df = pd.read_csv(io.BytesIO(contents), sep="\t")
        elif filename.endswith(".json"):
            data_json = json.loads(contents.decode("utf-8"))
            df = pd.DataFrame(data_json)
        else:
            # Try CSV parse
            df = pd.read_csv(io.BytesIO(contents))
            
        numeric_cols = get_numeric_columns(df)
        if len(numeric_cols) == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Uploaded file must contain at least one numeric metric column (e.g., Response_Time_ms, CPU_Utilization_pct)."
            )
            
        if "Record_ID" not in df.columns:
            df.insert(0, "Record_ID", [f"REC-{1000 + i}" for i in range(len(df))])
            
        store.df = df
        store.dataset_name = file.filename or "Uploaded Dataset"
        
        return {
            "success": True,
            "message": f"Successfully parsed {len(df)} records with {len(numeric_cols)} numeric metrics.",
            "rows": len(df),
            "columns": df.columns.tolist(),
            "numeric_metrics": numeric_cols
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process telemetry file: {str(e)}"
        )


@app.get("/api/metrics/summary", response_model=List[MetricSummary])
def get_metrics_summary(
    configuration: Optional[str] = Query(None),
    device_model: Optional[str] = Query(None),
    os_version: Optional[str] = Query(None),
    network_type: Optional[str] = Query(None)
):
    """
    Returns aggregated Central Tendency (Mean, 5% Trimmed Mean, Median, Mode)
    and Dispersion (StdDev, Variance, IQR, Min/Max, Percentiles) for all numerical metrics.
    """
    filtered_df = apply_filters(store.df, configuration, device_model, os_version, network_type)
    if len(filtered_df) == 0:
        return []
        
    num_cols = get_numeric_columns(filtered_df)
    summaries = []
    for col in num_cols:
        summary = get_metric_summary(filtered_df, col)
        summaries.append(summary)
        
    return summaries


@app.get("/api/metrics/distribution", response_model=DistributionResponse)
def get_metric_distribution(
    metric: str = Query(..., description="Target numerical metric"),
    group: Optional[str] = Query("All", description="Configuration group or All"),
    bins: int = Query(25, ge=5, le=60)
):
    """
    Returns histogram bin distribution, continuous KDE density estimation,
    reference markers (Mean, Median, Mode, P95, P99), and boxplot coordinates.
    """
    if metric not in store.df.columns:
        # Fallback to first available numeric metric
        nums = get_numeric_columns(store.df)
        if not nums:
            raise HTTPException(status_code=404, detail="No numeric metrics available.")
        metric = nums[0]
        
    return compute_distribution_response(store.df, metric=metric, group=group, num_bins=bins)


@app.get("/api/time-series", response_model=TimeSeriesResponse)
def get_time_series_data(
    metric: str = Query(..., description="Target metric for time series"),
    group: Optional[str] = Query("All", description="Target configuration"),
    window: int = Query(15, ge=3, le=50)
):
    if metric not in store.df.columns:
        nums = get_numeric_columns(store.df)
        if not nums:
            raise HTTPException(status_code=404, detail="No numeric metric found.")
        metric = nums[0]
        
    return compute_time_series(store.df, metric=metric, group=group, window=window)


@app.post("/api/analyze/custom")
def analyze_custom(req: CustomAnalysisRequest):
    """
    Executes an on-the-fly multi-dimensional filter analysis by device, OS,
    network tier, or architecture configuration.
    """
    filtered = apply_filters(
        store.df,
        configuration=req.configuration,
        device_model=req.device_model,
        os_version=req.os_version,
        network_type=req.network_type
    )
    
    if len(filtered) == 0:
        return {
            "status": "empty",
            "message": "No telemetry records matched the selected filter criteria.",
            "count": 0
        }
        
    metric = req.metric if req.metric in filtered.columns else get_numeric_columns(filtered)[0]
    data = filtered[metric].dropna().to_numpy()
    
    ct = compute_central_tendency(data)
    disp = compute_dispersion(data)
    outl, outlier_vals = compute_outliers(data, z_thresh=req.z_score_threshold or 3.0)
    
    # Custom trimmed mean calculation based on user requested trimmed percent
    trimmed_custom = float(stats.trim_mean(data, req.trimmed_percent or 0.05))
    
    return {
        "status": "success",
        "sample_count": len(data),
        "filters_applied": {
            "configuration": req.configuration or "All",
            "device_model": req.device_model or "All",
            "os_version": req.os_version or "All",
            "network_type": req.network_type or "All",
            "metric": metric,
            "custom_trim_percent": req.trimmed_percent
        },
        "central_tendency": {
            "mean": ct.mean,
            "custom_trimmed_mean": round(trimmed_custom, 2),
            "trimmed_mean_5": ct.trimmed_mean_5,
            "median": ct.median,
            "mode": ct.mode,
            "mode_frequency": ct.mode_frequency,
            "mean_median_diff": ct.mean_median_diff,
            "skewness_direction": ct.skewness_direction,
            "skewness_score": ct.skewness_score,
            "kurtosis_score": ct.kurtosis_score
        },
        "dispersion": {
            "std_dev": disp.std_dev,
            "variance": disp.variance,
            "iqr": disp.iqr,
            "min": disp.min,
            "max": disp.max,
            "p50": disp.p50,
            "p90": disp.p90,
            "p95": disp.p95,
            "p99": disp.p99,
            "coeff_of_variation_pct": disp.coeff_of_variation_pct
        },
        "outlier_analysis": {
            "lower_fence": outl.lower_fence,
            "upper_fence": outl.upper_fence,
            "outlier_count": outl.outlier_count,
            "outlier_percentage": outl.outlier_percentage,
            "zscore_outlier_count": outl.zscore_outlier_count,
            "sample_outlier_values": [round(x, 2) for x in outlier_vals[:20]]
        }
    }


@app.get("/api/recommendations", response_model=List[Recommendation])
def get_recommendations():
    """Returns automated system optimization decisions and diagnostic alerts."""
    return generate_system_recommendations(store.df)


@app.get("/api/data", response_model=PaginatedDataResponse)
def get_raw_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    sort_by: Optional[str] = Query(None),
    sort_dir: Optional[str] = Query("asc"),
    configuration: Optional[str] = Query(None),
    device_model: Optional[str] = Query(None),
    network_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Frosted-glass tabular raw data explorer with pagination, search, and sorting."""
    df = apply_filters(store.df, configuration=configuration, device_model=device_model, network_type=network_type)
    
    if search:
        search_mask = False
        for col in df.columns:
            search_mask = search_mask | df[col].astype(str).str.contains(search, case=False, na=False)
        df = df[search_mask]
        
    if sort_by and sort_by in df.columns:
        ascending = (sort_dir.lower() != "desc")
        df = df.sort_values(by=sort_by, ascending=ascending)
        
    total = len(df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    page_df = df.iloc[start_idx:end_idx]
    
    # Convert dataframe records to JSON serializable objects
    records = page_df.fillna("").to_dict(orient="records")
    
    return PaginatedDataResponse(
        total=total,
        page=page,
        page_size=page_size,
        columns=df.columns.tolist(),
        records=records
    )


@app.get("/api/export")
def export_dataset(format: str = Query("csv", pattern="^(csv|json)$")):
    """Exports current telemetry dataset."""
    if format == "csv":
        stream = io.StringIO()
        store.df.to_csv(stream, index=False)
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=telemetry_data_export.csv"
        return response
    else:
        json_str = store.df.to_json(orient="records", indent=2)
        response = StreamingResponse(iter([json_str]), media_type="application/json")
        response.headers["Content-Disposition"] = "attachment; filename=telemetry_data_export.json"
        return response
