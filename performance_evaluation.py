import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt

def generate_benchmark_data(num_samples=500, seed=42):
    """
    Simulates application performance telemetry across three system configurations:
    - Config A: Legacy Monolith (Higher baseline latency, frequent spikes)
    - Config B: Microservices - Uncached (Moderate latency, occasional cold-start outliers)
    - Config C: Microservices - Redis Cached (Low latency, tight distribution, high throughput)
    """
    np.random.seed(seed)
    
    configs = {
        "Config_A_Monolith": {
            # Normal distribution + exponential tail for latency spikes
            "Response_Time_ms": np.round(np.concatenate([
                np.random.normal(loc=210, scale=25, size=int(num_samples * 0.90)),
                np.random.uniform(low=450, high=900, size=int(num_samples * 0.10)) # 10% severe spikes
            ]), 0),
            "CPU_Utilization_pct": np.round(np.clip(np.random.normal(loc=74, scale=8, size=num_samples), 10, 100), 0),
            "Memory_Usage_MB": np.round(np.random.normal(loc=1024, scale=40, size=num_samples), -1),
            "Throughput_RPS": np.round(np.random.normal(loc=420, scale=35, size=num_samples), 0)
        },
        "Config_B_Micro_Uncached": {
            "Response_Time_ms": np.round(np.concatenate([
                np.random.normal(loc=125, scale=15, size=int(num_samples * 0.92)),
                np.random.uniform(low=380, high=750, size=int(num_samples * 0.08)) # 8% DB lock spikes
            ]), 0),
            "CPU_Utilization_pct": np.round(np.clip(np.random.normal(loc=58, scale=6, size=num_samples), 10, 100), 0),
            "Memory_Usage_MB": np.round(np.random.normal(loc=760, scale=30, size=num_samples), -1),
            "Throughput_RPS": np.round(np.random.normal(loc=780, scale=45, size=num_samples), 0)
        },
        "Config_C_Micro_Cached": {
            "Response_Time_ms": np.round(np.concatenate([
                np.random.normal(loc=45, scale=6, size=int(num_samples * 0.97)),
                np.random.uniform(low=110, high=180, size=int(num_samples * 0.03)) # 3% cache misses
            ]), 0),
            "CPU_Utilization_pct": np.round(np.clip(np.random.normal(loc=42, scale=5, size=num_samples), 10, 100), 0),
            "Memory_Usage_MB": np.round(np.random.normal(loc=890, scale=20, size=num_samples), -1),
            "Throughput_RPS": np.round(np.random.normal(loc=1450, scale=60, size=num_samples), 0)
        }
    }
    
    # Combine into a unified DataFrame
    frames = []
    for config_name, metrics in configs.items():
        df_cfg = pd.DataFrame(metrics)
        df_cfg["Configuration"] = config_name
        frames.append(df_cfg)
        
    return pd.concat(frames, ignore_index=True)


def evaluate_central_tendency(df):
    """
    Calculates Mean, Median, and Mode for every performance metric across configurations.
    Also computes skewness indicator (Mean - Median) to detect outlier distortion.
    """
    metrics = ["Response_Time_ms", "CPU_Utilization_pct", "Memory_Usage_MB", "Throughput_RPS"]
    records = []
    
    for config, group in df.groupby("Configuration", sort=False):
        for metric in metrics:
            data = group[metric].values
            
            mean_val = np.mean(data)
            median_val = np.median(data)
            # scipy.stats.mode handles multimodal or discrete rounded numerical data reliably
            mode_res = stats.mode(data, keepdims=True)
            mode_val = mode_res.mode[0]
            mode_count = mode_res.count[0]
            
            records.append({
                "Configuration": config,
                "Metric": metric,
                "Mean": round(mean_val, 2),
                "Median (P50)": round(median_val, 2),
                "Mode": round(mode_val, 2),
                "Mode_Freq": int(mode_count),
                "Mean_Median_Diff": round(mean_val - median_val, 2)
            })
            
    return pd.DataFrame(records)


def generate_optimization_decisions(summary_df):
    """
    Interprets central tendency discrepancies to output automated engineering recommendations.
    """
    print("\n" + "="*80)
    print("AUTOMATED SYSTEM OPTIMIZATION & DIAGNOSTIC REPORT")
    print("="*80)
    
    rt_df = summary_df[summary_df["Metric"] == "Response_Time_ms"]
    tp_df = summary_df[summary_df["Metric"] == "Throughput_RPS"]
    
    # 1. Identify best configuration by Median Response Time
    best_rt_row = rt_df.loc[rt_df["Median (P50)"].idxmin()]
    best_tp_row = tp_df.loc[tp_df["Mean"].idxmax()]
    
    print(f"\n[1] REPRESENTATIVE PERFORMANCE WINNER:")
    print(f"    -> Optimal Latency Config   : {best_rt_row['Configuration']} "
          f"(Median: {best_rt_row['Median (P50)']} ms, Mean: {best_rt_row['Mean']} ms)")
    print(f"    -> Optimal Throughput Config: {best_tp_row['Configuration']} "
          f"(Mean: {best_tp_row['Mean']} RPS, Median: {best_tp_row['Median (P50)']} RPS)")
    
    # 2. Outlier & Skewness Analysis (Mean vs. Median)
    print(f"\n[2] CENTRAL TENDENCY DIAGNOSTICS (OUTLIER IMPACT):")
    for _, row in rt_df.iterrows():
        diff = row["Mean_Median_Diff"]
        cfg = row["Configuration"]
        if diff > 15:
            print(f"    -> [WARNING] {cfg}: Mean ({row['Mean']} ms) is significantly higher than "
                  f"Median ({row['Median (P50)']} ms) by +{diff} ms.")
            print(f"       Diagnosis: Positive skewness caused by tail-latency spikes. "
                  f"Use Median ({row['Median (P50)']} ms) as representative SLA metric.")
        else:
            print(f"    -> [STABLE]  {cfg}: Mean ({row['Mean']} ms) closely aligns with "
                  f"Median ({row['Median (P50)']} ms) (Diff: +{diff} ms). Low tail-latency variance.")


def plot_performance_comparison(df, summary_df):
    """
    Creates visual plots showing Mean, Median, and Mode on Response Time distributions
    and a bar chart comparing all configurations.
    """
    configs = df["Configuration"].unique()
    fig, axes = plt.subplots(1, 3, figsize=(16, 5), sharey=True)
    fig.suptitle("Response Time (ms) Distribution with Mean, Median & Mode", fontsize=14, fontweight="bold")
    
    colors = ["#e0f2fe", "#fef3c7", "#dcfce7"]
    
    for idx, config in enumerate(configs):
        ax = axes[idx]
        subset = df[df["Configuration"] == config]["Response_Time_ms"]
        stats_row = summary_df[(summary_df["Configuration"] == config) & 
                               (summary_df["Metric"] == "Response_Time_ms")].iloc[0]
        
        ax.hist(subset, bins=30, color=colors[idx], edgecolor="black", alpha=0.8)
        ax.axvline(stats_row["Mean"], color="red", linestyle="--", linewidth=2, label=f"Mean: {stats_row['Mean']}ms")
        ax.axvline(stats_row["Median (P50)"], color="blue", linestyle="-", linewidth=2, label=f"Median: {stats_row['Median (P50)']}ms")
        ax.axvline(stats_row["Mode"], color="green", linestyle=":", linewidth=2, label=f"Mode: {stats_row['Mode']}ms")
        
        ax.set_title(config.replace("_", " "))
        ax.set_xlabel("Response Time (ms)")
        if idx == 0:
            ax.set_ylabel("Request Frequency")
        ax.legend(loc="upper right", fontsize=9)
        ax.grid(axis="y", linestyle="--", alpha=0.4)
        
    plt.tight_layout()
    plt.savefig("central_tendency_benchmark.png", dpi=300)
    print("\n[+] Saved benchmark visualization to 'central_tendency_benchmark.png'")


if __name__ == "__main__":
    print("="*80)
    print("MICRO PROJECT 10: APPLICATION PERFORMANCE EVALUATION")
    print("Industry Focus: Software Performance Engineering")
    print("="*80)
    
    # Step 1: Generate or Load Telemetry Data
    telemetry_df = generate_benchmark_data(num_samples=500)
    telemetry_df.to_csv("application_telemetry_data.csv", index=False)
    print(f"[+] Generated {len(telemetry_df)} telemetry records across 3 system configurations.")
    
    # Step 2: Calculate Measures of Central Tendency
    summary_table = evaluate_central_tendency(telemetry_df)
    
    # Step 3: Display Formatted Summary Table by Metric
    for metric, grp in summary_table.groupby("Metric", sort=False):
        print(f"\n--- Performance Indicator: {metric} ---")
        display_cols = ["Configuration", "Mean", "Median (P50)", "Mode", "Mode_Freq", "Mean_Median_Diff"]
        print(grp[display_cols].to_string(index=False))
        
    # Step 4: Output System Optimization Decisions
    generate_optimization_decisions(summary_table)
    
    # Step 5: Generate Chart for Project Report
    plot_performance_comparison(telemetry_df, summary_table)
