# Rural Diabetic Retinopathy (DR) Screening Pipeline

An automated, resource-optimized deep learning pipeline designed for rural Indian healthcare settings. This system performs fundus image quality enhancement, 5-class ordinal DR grading, binary "Referable DR" classification (Level 2+), and Grad-CAM explainability to support human-in-the-loop clinical reviews.

---

## 🚀 Key Performance & Clinical Metrics
Validated on the APTOS dataset:
* **Sensitivity (Recall):** 91.92% *(Target: >90%)*
* **Specificity:** 93.56% *(Target: >85%)*
* **Accuracy:** 92.90%
* **Precision (Positive Predictive Value):** 90.70%
* **F1-Score:** 91.30%
* **Classification Architecture:** Fine-tuned ResNet-50 (8 Epochs)
* **Environment:** MATLAB native execution on Apple Silicon (M4)

---

## 📂 Repository Structure
```text
├── M1_Fundus_Quality_Enhancement.m  # Preprocessing module (CLAHE, denoising, blur rejection)
├── M2_DR_Grading.m                  # Inference engine & Grad-CAM explainability module
├── train_dr_model.m                 # Training script for ResNet-50
├── train_enhanced.csv               # Reconciled dataset mapping ground truth to enhanced images
└── trainedDRModel.mat               # Pre-trained neural network weights (87.8 MB)