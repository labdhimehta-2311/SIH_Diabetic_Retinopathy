# SIH-DIABETIC RETINA

## Project Overview

SIH-DIABETIC RETINA is a diabetic retinopathy screening pipeline developed for the Smart India Hackathon (SIH).

The pipeline contains:

- **M1** – Fundus Image Quality Enhancement
- **M2** – Diabetic Retinopathy Grading
- **M3** – Multiclass Retinal Segmentation
- **M4** – Explainable AI

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

# Running M3 Without Training

The pretrained model is already included in the repository:

```text
src/segmentation/trained_models/unet_multiclass_improved_best.mat