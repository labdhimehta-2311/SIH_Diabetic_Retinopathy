# Rural Diabetic Retinopathy (DR) Screening Pipeline

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://www.sih.gov.in/)
[![Platform](https://img.shields.io/badge/Platform-MATLAB%20%7C%20Deep%20Learning-blue.svg)](https://www.mathworks.com/)
[![Clinical Targets](https://img.shields.io/badge/Referable%20DR-Sens%2091.92%25%20%7C%20Spec%2093.56%25-success.svg)](#key-performance--clinical-metrics)
[![XAI Enabled](https://img.shields.io/badge/XAI-Grad--CAM%20%2B%20Calibration-brightgreen.svg)](docs/modules/explainable_ai.md)

An automated, resource-optimized, explainable deep learning screening pipeline engineered for Primary Healthcare Centres (PHCs) and telemedicine networks in rural India.

This system performs fundus image quality triage, adaptive CLAHE contrast enhancement, ResNet-50 5-class ordinal DR grading, binary Referable DR triage (Level 2+), Grad-CAM visual attention mapping, temperature-scaled confidence calibration, and automated clinical report generation.

---

## 🚀 Key Performance & Clinical Metrics

Validated on the APTOS 2019 Blindness Detection dataset:
* **Sensitivity (Recall):** **91.92%** *(Clinical Target: >90%)*
* **Specificity:** **93.56%** *(Clinical Target: >85%)*
* **Overall Accuracy:** **92.90%**
* **Precision (Positive Predictive Value):** **90.70%**
* **F1-Score:** **91.30%**
* **Expected Calibration Error (ECE):** Reduced from $\sim 0.14$ to $<0.05$ via Temperature Scaling ($T = 1.35$)
* **Classification Backbone:** Fine-tuned ResNet-50 DAGNetwork (`trainedDRModel.mat`, 87.8 MB)
* **Execution Environment:** MATLAB (R2022b or later)

---

## 👥 Module Responsibilities & Linkages

| Module / Member | Contributor | Responsibility | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Module 1 (M1)** | Team Member 1 | **Image Quality Assessment & Adaptive Enhancement** | `M1_Fundus_Quality_Enhancement.m`<br>• Blur/sharpness estimation (Laplacian variance)<br>• Retinal aperture detection & coverage ratio<br>• Adaptive CLAHE enhancement in CIE L\*a\*b\* space |
| **Module 2 (M2)** | Team Member 2/3 | **Deep Learning 5-Class DR Severity Staging** | `M2_DR_Grading.m`, `train_dr_model.m`<br>• ResNet-50 5-level ordinal grading (Grades 0 to 4)<br>• Binary Referable DR classification (Level 2+)<br>• Offline model training and validation pipeline |
| **Module 4 (M4)** | **Member 4**<br>([@labdhimehta-2311](https://github.com/labdhimehta-2311)) | **Explainable AI (XAI) & Clinical Reporting** | `M4_Explainable_AI.m`, `gradCAM.m`<br>`src/explainability/`<br>• Grad-CAM visual attention heatmaps (`generateGradCAM.m`)<br>• Colormap alpha-blending on fundus (`overlayGradCAM.m`)<br>• Temperature-scaled confidence calibration (`calibrateConfidence.m`)<br>• Pathophysiological lesion-grade concordance (`correlateLesionsWithGrade.m`)<br>• Clinical evidence synthesis (`generateClinicalEvidence.m`)<br>• Automated telemedicine screening report exporter (`generateDRReport.m`) |

### Pipeline Dataflow
```
Raw Fundus Capture (Rural PHC)
     │
     ▼
[M1] Quality Assessment & Adaptive Enhancement (CLAHE in Lab space)
     │
     ▼
[M2] ResNet-50 Classification (5-Class Staging + Referable Triage)
     │
     ▼
[M4] Explainable AI & Clinical Synthesis (Member 4: labdhimehta-2311)
     ├── Grad-CAM Visual Attention Saliency (Final Convolutional Layer)
     ├── Temperature-Scaled Confidence Calibration (T = 1.35, ECE < 0.05)
     ├── Multi-Modal Lesion Concordance Verification
     └── Automated Clinical Screening Report Export (Text & Multi-Panel UI)
```

---

## 📂 Repository Structure

```text
SIH_Diabetic_Retinopathy/
├── README.md                          # Master documentation & clinical metrics
├── M1_Fundus_Quality_Enhancement.m    # M1: Quality assessment & adaptive CLAHE
├── M2_DR_Grading.m                    # M2: ResNet-50 inference linked with XAI
├── M4_Explainable_AI.m                # M4: Dedicated Explainable AI & Reporting module
├── gradCAM.m                          # High-level Grad-CAM wrapper function
├── run_pipeline_demo.m                # End-to-end demo script (M1 -> M2 -> M4)
├── train_dr_model.m                   # Training script for ResNet-50 backbone
├── train_enhanced.csv                 # Reconciled training metadata & ground truth
├── trainedDRModel.mat                 # Pre-trained ResNet-50 neural network weights
│
├── config/                            # Configuration & Clinical Lookup Tables
│   ├── projectConfig.m                # Hyperparameters, thresholds & relative paths
│   └── getClinicalMappings.m          # ICDR 5-level scale & referral recommendations
│
├── src/
│   └── explainability/                # Member 4 Core Implementation
│       ├── generateGradCAM.m          # Grad-CAM gradient backpropagation
│       ├── overlayGradCAM.m           # Turbo/Jet alpha-blended colormap fusion
│       ├── calibrateConfidence.m      # Temperature scaling probability calibration
│       ├── correlateLesionsWithGrade.m# Pathophysiological lesion concordance
│       ├── generateClinicalEvidence.m # Clinical evidence synthesis
│       └── generateDRReport.m         # Standardized telemedicine report generator
│
├── data/
│   └── samples/                       # Sample fundus images (Grades 0 to 4)
│
├── reports/                           # Output directory for clinical reports
│
├── tests/                             # Verification & Unit Test Suites
│   └── test_member4_explainability.m  # Comprehensive Member 4 test runner
│
└── docs/
    └── modules/
        └── explainable_ai.md          # In-depth mathematical & clinical documentation
```

---

## ⚡ Quick Start

### 1. Run the End-to-End Pipeline Demonstration
Open MATLAB in this directory and execute:
```matlab
run_pipeline_demo
```
This loads a sample fundus image, runs M1 quality enhancement, performs M2 deep learning classification, applies Member 4 Grad-CAM explainability, and exports a clinical report to `reports/`.

### 2. Run Member 4 Explainability Standalone
```matlab
M4_Explainable_AI
```
Executes Grad-CAM visual attention mapping, temperature scaling calibration, lesion concordance checking, and displays an interactive 4-panel diagnostic dashboard.

### 3. Run Individual Inference on an Enhanced Image
```matlab
% M2 DR Grading with Member 4 Explainability & Calibrated Confidence
[grade, isReferable, conf, reportPath] = M2_DR_Grading(enhancedImage, 'PATIENT_0042');
```

### 4. Run Automated Test Suite
```matlab
results = test_member4_explainability();
```

---

## 🛡️ Medical Device Prototype Disclaimer

> **STATUTORY DISCLAIMER**:  
> *This software is an engineering research prototype developed for the Smart India Hackathon (SIH) 2026. It is designed solely for screening evaluation and clinical decision support under qualified medical supervision. It is not currently certified by the Central Drugs Standard Control Organisation (CDSCO) or the U.S. FDA, and must not be used as an autonomous substitute for comprehensive professional ophthalmic examination.*