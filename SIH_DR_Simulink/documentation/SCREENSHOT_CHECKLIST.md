# SIH Presentation Deck — Screenshot Checklist & Presentation Guide
## Member 6: MATLAB / Simulink Simulation, Performance Analysis & Queue Modelling
**Author:** Member 6 (`labdhimehta-2311`)  
**Directory:** `SIH_DR_Simulink/figures/`

---

| # | Required SIH Screenshot | Generated Artifact File | Description & Judging Talking Point |
| :---: | :--- | :--- | :--- |
| **1** | **Complete Simulink Architecture** | `model/DR_Screening_Simulation.mdl` | Full Simulink / SimEvents block diagram showing Patient Arrival, Check-in, Fundus Image Capture, Network Delay Channel, Multi-Worker AI Inference Cluster, Doctor Review Station, and Screening Output Sink. |
| **2** | **Patient Arrival & Patient Queue** | `figures/graph03_patient_queue_vs_time.png` | Demonstrates FIFO queue length dynamics at the clinic check-in desk over an 8-hour shift. Shows smooth, stable queue dissipation under nominal arrival rates. |
| **3** | **AI Processing Queue & Multi-Worker Server** | `figures/graph04_ai_queue_vs_time.png` | Proves that 2 parallel AI worker threads maintain near-zero waiting times for image grading, processing requests in ~2 seconds. |
| **4** | **Doctor Review Queue & Specialist Station** | `figures/graph05_doctor_queue_vs_time.png` | Highlights queue accumulation when patient arrival rate approaches the single-doctor review limit (60 pts/hr), proving where congestion forms. |
| **5** | **Simulation Running Cleanly & Metrics Verification** | Console Execution & `results/summary_metrics.csv` | Proof of zero warnings, zero entity loss, non-negative wait times, and exact Little's Law conservation across all stages. |
| **6** | **Latency vs Patient Arrival Rate** | `figures/graph01_latency_vs_arrival_rate.png` | Graph showing Average, Median, and 95th Percentile Latency across 10 to 120 patients/hour. Highlights the inflection point where queuing delay takes over. |
| **7** | **Throughput vs Patient Arrival Rate** | `figures/graph02_throughput_vs_arrival_rate.png` | Shows throughput scaling linearly up to ~50 pts/hr and plateauing at the single-doctor capacity boundary (60 pts/hr). |
| **8** | **Multi-Stage Queue Dynamics Over Time** | `figures/graph13_queue_evolution_multistage.png` | Multi-station queue evolution with shaded confidence intervals (matching project reference materials), comparing Triage, AI Queue, and Doctor Queue. |
| **9** | **Station Resource Utilization** | `figures/graph06_resource_utilization.png` | Clear comparative plot showing Fundus Camera, AI Server, and Doctor Tele-Review utilizations across patient load, identifying the doctor station as the binding constraint. |
| **10** | **Baseline vs Proposed Comparison** | `figures/graph14_baseline_vs_proposed_comparison.png` | Direct head-to-head comparison showing 97.4% latency reduction achieved by the AI-assisted system over the traditional manual workflow. |
| **11** | **Infrastructure Resource Scaling (Scenarios A to E)** | `figures/graph10_ai_workers_scaling.png` & `figures/graph11_doctor_capacity_scaling.png` | Proves that adding AI workers alone does not resolve congestion; adding a 2nd tele-doctor (Scenario D) collapses queue backlog from 15.6 to 0.18 patients. |
| **12** | **FIFO vs AI-Risk Prioritized Queue** | `figures/graph12_fifo_vs_priority_queue.png` | Demonstrates that AI risk triage slashes wait times for urgent/proliferative DR patients by 74.2% (from 76.6s to 19.8s). |
| **13** | **Network Latency Robustness** | `figures/graph07_network_delay_vs_latency.png` | Proves that round-trip tele-ophthalmology network delays (10ms to 1000ms) constitute < 0.65% of screening turnaround, confirming feasibility for remote Indian villages. |
| **14** | **System Performance Dashboard** | Output of `generateDashboard.m` / Terminal Banner | High-impact executive summary card displaying patient load, completed count, throughput, P95 latency, queue lengths, and automated bottleneck diagnosis. |
