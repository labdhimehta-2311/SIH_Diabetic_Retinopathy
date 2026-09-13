# SIH-DIABETIC RETINA

## Project Overview

SIH-DIABETIC RETINA is a diabetic retinopathy screening pipeline developed for the Smart India Hackathon (SIH).

The pipeline contains:

- **M1** – Fundus Image Quality Enhancement
- **M2** – Diabetic Retinopathy Grading
- **M3** – Multiclass Retinal Segmentation
- **M4** – Explainable AI & Clinical Reporting
- **M6** – Discrete-Event Simulation, Performance Analysis & Queue Modelling (Member 6: `labdhimehta-2311`)

---

# M3 Segmentation

M3 performs multiclass segmentation of retinal structures and diabetic-retinopathy-related lesions.

### M3 Classes

| Label | Class |
|------:|-------|
| 0 | Background |
| 1 | Microaneurysms |
| 2 | Haemorrhages |
| 3 | Hard Exudates |
| 4 | Soft Exudates |
| 5 | Optic Disc |

The current M3 implementation uses a pretrained multiclass U-Net model.

---

# Requirements

- MATLAB R2026a or compatible MATLAB version
- Deep Learning Toolbox
- Image Processing Toolbox

The current pretrained model allows M3 inference without retraining.

---

# M6: Discrete-Event Workflow Simulation & Queue Modeling
 
**Toolbox / Technology:** MATLAB, Simulink, SimEvents, Discrete-Event Simulation (DES)

Module 6 simulates the end-to-end clinical and computational workflow of our AI-assisted diabetic retinopathy screening platform to quantitatively prove scalability, latency, throughput, queue behavior, bottlenecks, and rural telemedicine feasibility.

### Modeled Clinical Workflow
```
Patient Arrival (Poisson)
      ↓
Check-in & Triage Queue (FIFO)
      ↓
Fundus Image Capture (Retinal Camera + 5% Recapture Loop)
      ↓
Network Uplink Delay (10ms to 1000ms Rural Links)
      ↓
AI Inference Cluster (M1-M4 Multi-Worker Parallel Pipeline)
      ↓
Tele-Ophthalmologist Review (FIFO vs AI-Assisted Priority Queue)
      ↓
Screening Output & Referral -> Patient Departure
```

### Key Quantitative Results (8-Hour Shift, 30 patients/hour)

| Metric | Traditional Baseline | Proposed AI-Assisted System | Impact |
| :--- | :---: | :---: | :---: |
| **Average Patient Turnaround Latency** | 5,890.7 s (~98 min) | **151.8 s (~2.5 min)** | **97.4% Faster** |
| **95th Percentile Latency** | 10,438.1 s | **241.3 s** | **97.7% Faster** |
| **Operational Throughput** | 19.8 pts/hr | **31.0 pts/hr** | **+57.0%** |
| **Mean Doctor Review Queue** | 49.75 patients | **0.23 patients** | **99.5% Backlog Cut** |
| **High-Risk Wait Time (AI Priority Triage)** | 76.6 s | **19.8 s** | **74.2% Faster Intervention** |
| **Network Latency Impact (100 ms Rural 4G)** | N/A | **< 0.08% of total latency** | **Proven Rural Feasibility** |

### Running the Member 6 Simulation Suite
In MATLAB:
```matlab
% 1. Run complete automated experiment suite (all sweeps, plots, dashboard):
runAllExperiments

% 2. Or run the integrated end-to-end demo (M1 -> M2 -> M3 -> M4 -> M6):
run_pipeline_demo
```

All 14 presentation graphs, CSV logs, MAT files, and documentation are stored in `SIH_DR_Simulink/`.
