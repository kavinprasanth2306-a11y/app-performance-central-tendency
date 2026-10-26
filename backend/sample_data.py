import os
import pandas as pd
import numpy as np


def generate_rich_telemetry(num_samples: int = 1200, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic, production-grade telemetry dataset for web/mobile applications
    with simulated multi-tier configurations, real device models, OS versions, network tiers,
    and heavy-tail outlier latency spikes.
    """
    np.random.seed(seed)
    
    configs = [
        {"name": "Config_C_Micro_Cached", "ratio": 0.45, "rt_loc": 45, "rt_scale": 6, "spike_pct": 0.02, "spike_range": (110, 200), "cpu_loc": 38, "mem_loc": 650, "tput_loc": 1400, "launch_loc": 520, "fps_loc": 1.2},
        {"name": "Config_B_Micro_Uncached", "ratio": 0.35, "rt_loc": 120, "rt_scale": 15, "spike_pct": 0.07, "spike_range": (350, 720), "cpu_loc": 58, "mem_loc": 820, "tput_loc": 750, "launch_loc": 980, "fps_loc": 4.5},
        {"name": "Config_A_Monolith", "ratio": 0.20, "rt_loc": 215, "rt_scale": 25, "spike_pct": 0.12, "spike_range": (480, 950), "cpu_loc": 76, "mem_loc": 1050, "tput_loc": 410, "launch_loc": 1650, "fps_loc": 12.0}
    ]
    
    devices = [
        {"model": "iPhone 15 Pro", "os": "iOS 18", "weight": 0.30, "perf_mult": 0.85},
        {"model": "Samsung Galaxy S24", "os": "Android 14", "weight": 0.25, "perf_mult": 0.90},
        {"model": "Google Pixel 8", "os": "Android 14", "weight": 0.20, "perf_mult": 0.95},
        {"model": "OnePlus 12", "os": "Android 14", "weight": 0.15, "perf_mult": 1.00},
        {"model": "Legacy Test Device", "os": "Android 11", "weight": 0.10, "perf_mult": 1.55}
    ]
    
    networks = [
        {"type": "Wi-Fi_6", "lat_add": 5, "weight": 0.40},
        {"type": "5G", "lat_add": 18, "weight": 0.35},
        {"type": "4G_LTE", "lat_add": 65, "weight": 0.20},
        {"type": "3G_Poor", "lat_add": 220, "weight": 0.05}
    ]
    
    rows = []
    
    for cfg in configs:
        count = int(num_samples * cfg["ratio"])
        for _ in range(count):
            # Select device
            dev_probs = [d["weight"] for d in devices]
            dev = np.random.choice(devices, p=dev_probs)
            
            # Select network
            net_probs = [n["weight"] for n in networks]
            net = np.random.choice(networks, p=net_probs)
            
            # Generate latency with spike simulation
            is_spike = np.random.rand() < cfg["spike_pct"]
            if is_spike:
                raw_rt = np.random.uniform(cfg["spike_range"][0], cfg["spike_range"][1])
            else:
                raw_rt = max(10, np.random.normal(cfg["rt_loc"], cfg["rt_scale"]))
                
            rt = round((raw_rt * dev["perf_mult"]) + net["lat_add"], 1)
            cpu = round(float(np.clip(np.random.normal(cfg["cpu_loc"], 6) * dev["perf_mult"], 12, 99)), 1)
            mem = round(float(np.clip(np.random.normal(cfg["mem_loc"], 40), 250, 2048)), 0)
            tput = round(float(np.clip(np.random.normal(cfg["tput_loc"], 50) / (net["lat_add"]/20 + 0.8), 50, 3000)), 0)
            launch = round(float(np.clip(np.random.normal(cfg["launch_loc"], 60) * dev["perf_mult"], 300, 4500)), 0)
            fps_drop = round(float(np.clip(np.random.exponential(cfg["fps_loc"]), 0.0, 35.0)), 2)
            payload = round(float(np.clip(np.random.normal(480, 150), 40, 2500)), 1)
            
            rows.append({
                "Response_Time_ms": rt,
                "CPU_Utilization_pct": cpu,
                "Memory_Usage_MB": mem,
                "Throughput_RPS": tput,
                "App_Launch_Time_ms": launch,
                "FPS_Drop_Rate": fps_drop,
                "Network_Payload_KB": payload,
                "Configuration": cfg["name"],
                "Device_Model": dev["model"],
                "OS_Version": dev["os"],
                "Network_Type": net["type"]
            })
            
    df = pd.DataFrame(rows)
    # Add simulated index / record id
    df["Record_ID"] = [f"TEL-{1000 + i}" for i in range(len(df))]
    return df


def load_initial_dataset() -> pd.DataFrame:
    """
    Attempts to read the workspace telemetry CSV. If it lacks device metadata,
    merges or upgrades it gracefully, or provides the complete rich dataset.
    """
    root_csv = os.path.join(os.path.dirname(__file__), "..", "application_telemetry_data.csv")
    if os.path.exists(root_csv):
        try:
            df = pd.read_csv(root_csv)
            # If the CSV has the basic 4 columns, enrich it with simulated device/network metadata
            # so all features (filtering, custom analysis) work seamlessly!
            if "Device_Model" not in df.columns:
                n = len(df)
                np.random.seed(42)
                devices = ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8", "OnePlus 12", "Legacy Test Device"]
                os_map = {"iPhone 15 Pro": "iOS 18", "Samsung Galaxy S24": "Android 14", "Google Pixel 8": "Android 14", "OnePlus 12": "Android 14", "Legacy Test Device": "Android 11"}
                dev_choices = np.random.choice(devices, size=n, p=[0.3, 0.25, 0.2, 0.15, 0.1])
                df["Device_Model"] = dev_choices
                df["OS_Version"] = [os_map[d] for d in dev_choices]
                df["Network_Type"] = np.random.choice(["Wi-Fi_6", "5G", "4G_LTE", "3G_Poor"], size=n, p=[0.4, 0.35, 0.2, 0.05])
                
                if "App_Launch_Time_ms" not in df.columns:
                    # Synthetic launch time correlated with response time
                    df["App_Launch_Time_ms"] = (df["Response_Time_ms"] * 4.2 + np.random.normal(300, 50, size=n)).round(0)
                if "FPS_Drop_Rate" not in df.columns:
                    df["FPS_Drop_Rate"] = (df["CPU_Utilization_pct"] * 0.12 + np.random.exponential(1.5, size=n)).round(2)
                if "Network_Payload_KB" not in df.columns:
                    df["Network_Payload_KB"] = np.random.normal(512, 120, size=n).round(1)
                if "Record_ID" not in df.columns:
                    df["Record_ID"] = [f"TEL-{1000 + i}" for i in range(len(df))]
            return df
        except Exception as e:
            print(f"Warning loading root CSV: {e}")
            
    # Default fallback
    return generate_rich_telemetry(num_samples=1200)
