from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CentralTendency(BaseModel):
    mean: float
    trimmed_mean_5: float
    trimmed_mean_10: float
    median: float
    mode: float
    mode_frequency: int
    mean_median_diff: float
    skewness_direction: str  # "Positive (Right) Skew", "Negative (Left) Skew", "Symmetric"
    skewness_score: float
    kurtosis_score: float


class DispersionMetrics(BaseModel):
    std_dev: float
    variance: float
    iqr: float
    min: float
    max: float
    range_val: float
    p10: float
    p25: float
    p50: float
    p75: float
    p90: float
    p95: float
    p99: float
    coeff_of_variation_pct: float


class OutlierMetrics(BaseModel):
    lower_fence: float
    upper_fence: float
    outlier_count: int
    outlier_percentage: float
    zscore_outlier_count: int


class MetricSummary(BaseModel):
    metric_name: str
    count: int
    central_tendency: CentralTendency
    dispersion: DispersionMetrics
    outliers: OutlierMetrics
    sparkline: List[float]


class DistributionBin(BaseModel):
    bin_start: float
    bin_end: float
    bin_center: float
    count: int
    density: float


class BoxPlotData(BaseModel):
    metric: str
    group_name: str
    min_val: float
    q1: float
    median: float
    q3: float
    max_val: float
    lower_whisker: float
    upper_whisker: float
    iqr: float
    outliers: List[float]


class ReferenceLines(BaseModel):
    mean: float
    median: float
    mode: float
    p95: float
    p99: float


class KdePoint(BaseModel):
    x: float
    y: float


class DistributionResponse(BaseModel):
    metric: str
    group: Optional[str] = "All"
    bins: List[DistributionBin]
    kde_curve: List[KdePoint]
    reference_lines: ReferenceLines
    boxplot: BoxPlotData
    skewness_summary: Dict[str, Any]


class TimeSeriesPoint(BaseModel):
    index: int
    timestamp: Optional[str] = None
    value: float
    rolling_mean: float
    upper_band: float
    lower_band: float
    is_outlier: bool
    group: Optional[str] = None


class TimeSeriesResponse(BaseModel):
    metric: str
    points: List[TimeSeriesPoint]


class Recommendation(BaseModel):
    id: str
    title: str
    category: str
    severity: str  # "critical", "warning", "info", "success"
    metric: str
    target_group: Optional[str] = None
    diagnosis: str
    recommendation: str
    formula_justification: str


class CustomAnalysisRequest(BaseModel):
    metric: Optional[str] = "Response_Time_ms"
    configuration: Optional[str] = None
    device_model: Optional[str] = None
    os_version: Optional[str] = None
    network_type: Optional[str] = None
    trimmed_percent: Optional[float] = 0.05
    z_score_threshold: Optional[float] = 3.0


class FilterOptions(BaseModel):
    configurations: List[str]
    device_models: List[str]
    os_versions: List[str]
    network_types: List[str]
    metrics: List[str]
    total_records: int


class PaginatedDataResponse(BaseModel):
    total: int
    page: int
    page_size: int
    columns: List[str]
    records: List[Dict[str, Any]]
