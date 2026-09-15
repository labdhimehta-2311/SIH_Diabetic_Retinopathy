# 👁️ RetinX Clinical: Diabetic Retinopathy Portal

> An advanced, multi-tenant clinical screening platform bridging modern web frameworks with heavy-duty MATLAB deep learning for real-time Diabetic Retinopathy (DR) diagnostics.

## 🚀 Project Overview

RetinX Clinical is engineered for vitreoretinal specialists and outreach clinicians. It provides a highly secure, offline-capable Patient Directory and Intake Pipeline that captures raw fundus images and routes them to a high-performance Python/MATLAB backend. The system evaluates the retina, generates clinical confidence metrics, and provides visual explainability (heatmaps and lesion masks) for medical professionals.

---

## ✨ Core Features

*   **Multi-Tenant Clinical Isolation:** Secure Google Authentication (via Firebase) ensures that doctors only have access to their designated patient directories, maintaining strict HIPAA-compliant data boundaries.
*   **Offline-First EMR Sync:** Built for rural and outreach camps, the platform utilizes a custom `SyncQueue` and a persistent local storage cache. Screenings can be performed offline and automatically synced to the cloud when a network connection is restored.
*   **Defensive Data Sanitization:** A custom middleware layer strips massive Base64 image payloads before writing to local storage, entirely preventing 5MB browser quota crashes.
*   **Interactive Diagnostic Matrix:** A bespoke 4-panel comparative viewer allowing clinicians to inspect raw fundus images side-by-side with AI overlays, featuring an adjustable alpha-blend slider for Grad-CAM and U-Net masks.
*   **Smart Session Control:** Robust account management allowing clinicians to seamlessly "Switch Providers" or perform a "Secure Sign Out" without leaking session state.

---

## 🧠 AI & Diagnostic Pipeline

The application relies on a sequential, 4-stage machine learning architecture executed via a MATLAB compute engine.

| Module | Core Technology | Clinical Function |
| :--- | :--- | :--- |
| **M1: Pre-processing** | **CLAHE Algorithm** | Contrast Limited Adaptive Histogram Equalization targets the green channel to maximize the visibility of retinal vasculature. |
| **M2: Classification** | **ResNet-50** | Evaluates the processed image to output a standard DR severity grade (0-4) and a statistical confidence score. |
| **M3: Segmentation** | **U-Net** | Generates precise binary masks to highlight microaneurysms, hemorrhages, and hard/soft exudates. |
| **M4: Explainability** | **Grad-CAM** | Renders neural activation heatmaps to provide visual transparency into the ResNet-50 model's diagnostic focus. |

### 📊 Clinical Metrics Evaluated
*   **DR Grading Scale:** 0 (Normal) to 4 (Proliferative DR).
*   **Referable Flag:** Automated binary trigger for tertiary care routing.
*   **Inference Speed:** Real-time logging of execution time (`executionTimeSec`).
*   **Confidence Scoring:** Percentage-based certainty metrics.

---

## 🏗️ System Architecture

*   **Decoupled Client-Server Model:** The Next.js presentation layer communicates with the heavy computational layer strictly via RESTful HTTP (Multipart FormData) on port `8000`.
*   **FastAPI Bridge:** A high-performance ASGI Python server acts as a middleware bridge, translating web requests into native commands for the persistent `matlab.engine`.
*   **Global State Machine:** React Context (`AuthContext`) serves as the central nervous system, tracking authenticated Google users, active clinical sessions, and local device profiles.

---

## 🛠️ Technology Stack

### Frontend (Client & UI)
*   **Framework:** Next.js & React
*   **Styling:** Tailwind CSS (Glassmorphism, responsive grids, print media queries)
*   **Animations:** GSAP (`@gsap/react`)
*   **Icons:** Lucide React

### Backend (Bridge Server)
*   **Language:** Python 3.x
*   **Framework:** FastAPI & Uvicorn
*   **Data Handling:** Native `json`, `base64`, `tempfile`, and `os` libraries for payload decoding.

### AI & Deep Learning
*   **Compute Engine:** MATLAB (`matlab.engine`)
*   **Models:** ResNet-50, U-Net, Grad-CAM, CLAHE

### Cloud & Infrastructure
*   **Authentication:** Firebase Auth (Google Sign-In)
*   **Database Sync:** Firebase Firestore (with LocalStorage failover)
*   **Caching:** HTML5 Local Storage with custom `sanitizeForLocalStorage` protocols.


---
*Disclaimer: This software is a diagnostic aid and research tool. It is not a replacement for professional ophthalmological evaluation.*