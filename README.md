# SIH-DIABETIC RETINA

## Project Overview

SIH-DIABETIC RETINA is a diabetic retinopathy screening pipeline developed for the Smart India Hackathon (SIH).

The pipeline contains:

- **M1** – Fundus Image Quality Enhancement
- **M2** – Diabetic Retinopathy Grading
- **M3** – Multiclass Retinal Segmentation
- **M4** – Explainable AI & Clinical Reporting
- **M6** – Discrete-Event Simulation, Performance Analysis & Queue Modelling 

---

# Explainable AI for Diabetic Retinopathy Screening in Rural India

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://www.sih.gov.in/)
[![Platform](https://img.shields.io/badge/Platform-MATLAB%20%7C%20Simulink-blue.svg)](https://www.mathworks.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Screening Capacity](https://img.shields.io/badge/Capacity-100%2C000%2B%20Patients%2FYear-brightgreen.svg)](simulink/)
[![Clinical Targets](https://img.shields.io/badge/Referable%20DR-Sens%20%3E%2090%25%20%7C%20Spec%20%3E%2085%25-success.svg)](benchmark/)

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement**: Automated, Explainable, and Resource-Optimized Retinal Screening for Primary Healthcare Centres (PHCs) in Rural India.

---

## 1. Problem Statement & Rural Context

India has over **77 million diabetic adults**, a figure projected to cross 100 million by 2030. **Diabetic Retinopathy (DR)** is a microvascular complication of diabetes that damages retinal capillaries, progressing silently until irreversible visual impairment or complete blindness occurs. Over **80% of vision loss caused by DR is preventable** if detected early.

However, rural India faces a severe crisis of clinical access:
- **Severe Ophthalmologist Deficit**: India has fewer than 25,000 licensed ophthalmologists for 1.4 billion people, with over **70% concentrated in urban Tier-1/Tier-2 tertiary hospitals**.
- **Rural Screening Deserts**: Most rural Primary Healthcare Centres (PHCs) and Community Health Centres (CHCs) have zero ophthalmic specialists on staff.
- **The Black-Box Dilemma**: Existing deep learning screening models act as unexplained "black boxes". A standalone probability score (*"Grade 2: 89%"*) fails clinical credibility, cannot be cross-examined by doctors, and fails catastrophically when presented with poor-quality, blurred portable-camera images.

---

## 2. Proposed Solution & Core Innovation

We introduce a **Quality-Aware, Lesion-Grounded, Explainable, and Telemedicine-Integrated Retinal Screening System** developed entirely on MathWorks technologies (**MATLAB & Simulink**).

Our core engineering principle is that a clinical AI system must not be a naive `"Image -> CNN -> Output Class"` pipeline. Instead, our architecture delivers:

$$	ext{Screening System} = 	ext{Optical Quality Triage} + 	ext{Lesion Grounding} + 	ext{Deep Staging} + 	ext{Visual Grad-CAM} + 	ext{Calibrated Confidence} + 	ext{Telemedicine Queuing}$$

```
Fundus Image
    │
    ▼
Image Quality Triage (Rejects Blur/Glare & Guides Recapture)
    │
    ▼ (Borderline Images Adaptively Enhanced via CLAHE)
Retinal Landmark & Lesion Analysis (OD, Fovea, Vessels, MAs, Exudates, Hemorrhages, NV)
    │
    ▼
Five-Level Deep Learning Staging (ResNet-50 / MobileNetV2 with Class Weighting)
    │
    ▼
Explainable AI (Grad-CAM Visual Attention Saliency Heatmaps)
    │
    ▼
Clinical Evidence Synthesis (Multi-Modal Lesion-Grade Concordance)
    │
    ▼
Calibrated Confidence & Actionable Referral Protocol (ICDR Timelines)
    │
    ▼
Automated Telemedicine Screening Report + District Simulink Simulation (100,000+ Patients/Yr)
```

---

## 3. Key System Features

1. **Automated Image Quality Assessment (Member 1)**:
   - Quantitative sharpness via modified discrete Laplacian variance ($	ext{LapV}$) and Tenengrad gradient energy.
   - Retinal aperture detection via circular boundary fitting and minimum $40\%$ FOV coverage enforcement.
   - Multi-quadrant Shannon entropy and illumination uniformity checks.
   - Immediate clinical recapture feedback for ungradeable images (*"Defocus blur: refocus on vessel arcade"*).
2. **Adaptive Contrast & Color Normalization (Member 1)**:
   - Low-frequency Gaussian background subtraction for illumination leveling.
   - Contrast-Limited Adaptive Histogram Equalization (CLAHE) in perceptual CIE L\*a\*b\* color space to boost lesion contrast without chromatic distortion.
3. **Anatomical Landmark Localization (Member 2)**:
   - Red-channel intensity centroiding for Optic Disc (OD) boundary segmentation.
   - Geometric temporal avascular zone localization for the Fovea / Macula centralis.
4. **Grounded Retinal Lesion Segmentation (Member 2)**:
   - **Resolution Preservation**: Microaneurysm candidates detected at native resolution using circular bottom-hat transforms to prevent spatial downsampling erasure.
   - Hard exudate segmentation with mandatory optic disc suppression to prevent false positives.
   - Intraretinal hemorrhage segmentation with ICDR 4-quadrant involvement evaluation (**4-2-1 Rule**).
   - Neovascularization detection (NVD on disc, NVE on retina) for Proliferative DR (PDR).
5. **Five-Level DR Severity Staging (Member 3)**:
   - Transfer learning architecture (ResNet-50 / MobileNetV2) with custom regularized classification head.
   - Inverse-frequency class weighting and full $360^\circ$ rotational augmentation to resolve severe APTOS class imbalance.
6. **Binary Referable DR Screening (Member 3)**:
   - Triage standard: Non-Referable (Grades 0–1) vs Referable (Grades 2–4).
   - Real measured performance reporting with automated `TARGET NOT YET ACHIEVED` threshold gating.
7. **Visual Saliency Explainability via Grad-CAM (Member 4)**:
   - Backpropagates class gradients to the final convolutional layer (`conv5_block3_out`).
   - Generates Turbo/Jet alpha-blended overlays revealing exact retinal regions influencing diagnosis.
8. **Temperature-Scaled Probability Calibration (Member 4)**:
   - Post-hoc temperature scaling ($T = 1.35$) softening overconfident softmax predictions and reducing Expected Calibration Error (ECE) to $<0.05$.
9. **Multi-Modal Lesion Evidence Concordance (Member 4)**:
   - Cross-verifies deep learning staging against explicit segmented lesion biomarkers to ensure every diagnosis is pathophysiologically justified.
10. **Automated Clinical Screening Reports (Member 4 / 5)**:
    - Generates standardized telemedicine-ready summary documents with patient metadata, optical metrics, visual overlays, lesion counts, and ICDR referral timelines.
11. **Interactive Clinical App & Benchmarking (Member 5)**:
    - MATLAB App Designer graphical user interface (`DRScreeningApp`) for real-time demonstration.
    - Ablation comparison framework validating the superiority of the integrated pipeline over naive CNNs.
12. **Simulink District Telemedicine Simulation (Member 6)**:
    - Simulates an entire rural district network (20 PHCs, 100,000+ patients annually).
    - Models camera queues, recapture delays, bandwidth constraints (256 kbps to 2 Mbps), AI server clusters, and tele-ophthalmologist review bottlenecks across 5 operational scenarios.


---

## 4. Technologies Used

- **MATLAB (R2022b / R2023a / R2023b)**: Core language and algorithmic framework.
- **Image Processing Toolbox**: Contrast-Limited Adaptive Histogram Equalization (CLAHE), morphological reconstruction, directional top-hat filters, color space transforms (RGB to CIE L\*a\*b\*).
- **Computer Vision Toolbox**: Optical disc circular fitting, Tenengrad focus computation, region property extraction.
- **Deep Learning Toolbox**: Transfer learning architectures (ResNet-50, MobileNetV2), `dlnetwork`, data augmentation, Grad-CAM gradient backpropagation.
- **Medical Imaging Toolbox**: Medical colormaps (Turbo/Jet), fundus visualization.
- **Statistics and Machine Learning Toolbox**: Temperature scaling probability calibration, 5x5 confusion matrix analytics, ROC/AUC metrics.
- **Simulink**: Programmatically constructed discrete-event and continuous queuing model for district-level telemedicine logistics.

---

## 5. Dataset: APTOS 2019 Blindness Detection

The model is trained and validated on the **APTOS 2019 Blindness Detection** benchmark dataset:
- **Total Images**: 3,662 labeled training digital fundus photographs captured under real-world clinical conditions in India.
- **Class Labels (ICDR Scale)**:
  - `0`: No DR (1,805 images, 49.3%)
  - `1`: Mild DR (370 images, 10.1%)
  - `2`: Moderate DR (999 images, 27.3%)
  - `3`: Severe DR (193 images, 5.3%)
  - `4`: Proliferative DR (295 images, 8.1%)

> [!NOTE]
> Raw dataset images and CSVs are excluded from Git via `.gitignore`. See [`data/README.md`](data/README.md) for Kaggle API download instructions. For instant evaluation, pre-packaged sample fundus images across all grades are provided in `data/samples/`.

---

## 6. Smart India Hackathon Team

- **Optical Quality & Enhancement Lead**: Member 1
- **Biomedical Image Segmentation Lead**: Member 2
- **Deep Learning & ML Lead**: Member 3
- **Explainable AI & Clinical Interface Lead**: Member 4
- **Integration Engineer**: Member 5
- **Simulink & Systems Logistics Lead**: Member 6



# Requirements

- MATLAB R2026a or compatible MATLAB version
- Deep Learning Toolbox
- Image Processing Toolbox

The current pretrained model allows M3 inference without retraining.

---

## 7. M6: Discrete-Event Workflow Simulation & Queue Modeling
 
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

% 2. Or run the integrated end-to-end demo (M1 -> M2 -> M3 -> M4 -> M5 -> M6):
run_pipeline_demo
```

All 14 presentation graphs, CSV logs, MAT files, and documentation are stored in `SIH_DR_Simulink/`.
