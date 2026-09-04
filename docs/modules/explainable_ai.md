# Module 4: Explainable AI & Automated Clinical Screening Reports

**Lead Responsibility**: Member 4 (labdhimehta-2311 - Explainable AI & Clinical Interface Engineering)  
**Primary Modules**:
- `src/explainability/generateGradCAM.m`
- `src/explainability/overlayGradCAM.m`
- `src/explainability/calibrateConfidence.m`
- `src/explainability/correlateLesionsWithGrade.m`
- `src/explainability/generateClinicalEvidence.m`
- `src/explainability/generateDRReport.m`
- `M4_Explainable_AI.m`
- `gradCAM.m` (Integration Wrapper)

---

## 1. Clinical Rationale: Beyond Black-Box AI

In medical screening for Primary Healthcare Centres (PHCs) in rural India, presenting an ungrounded probability score (e.g., *"Grade 2 - 94% confidence"*) fails to meet clinical safety, medicolegal, and explainability standards. Attending ophthalmologists and medical officers require interpretable answers to three critical questions:
1. **Visual Grounding**: *Which anatomical regions of the retina drove the network's prediction?*
2. **Pathophysiological Grounding**: *Are specific microaneurysms, hemorrhages, or exudates present to justify this severity grade?*
3. **Calibrated Reliability**: *Is the reported confidence statistically calibrated or falsely overconfident?*

---

## 2. Visual Explainability: Grad-CAM (`generateGradCAM.m` / `gradCAM.m`)

**Gradient-weighted Class Activation Mapping (Grad-CAM)** highlights the discriminative image regions utilized by the deep convolutional network:

### Mathematical Derivation
1. **Channel Weights**: The importance weight $\alpha_k^c$ of feature map $A^k$ in the final convolutional layer (`conv5_block3_out` or `activation_49_relu` in ResNet-50) for class $c$ is computed via global average pooling of gradients:
   $$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial Y^c}{\partial A_{ij}^k}$$
   where $Y^c$ is the pre-softmax score for class $c$, and $Z = U \times V$ is the spatial grid dimensions.
2. **Activation Mapping**: The heat map is a weighted linear combination followed by a Rectified Linear Unit (ReLU) to isolate features with a positive influence on the target diagnosis:
   $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_{k} \alpha_k^c A^k\right)$$
3. **Bilinear Upsampling & Overlay**: The map is upsampled to the original fundus dimensions and alpha-blended with a Turbo or Jet pseudocolor map ($\alpha = 0.45$).

---

## 3. Probability Calibration (`calibrateConfidence.m`)

Modern deep neural networks trained with cross-entropy loss are notoriously uncalibrated, outputting extreme confidences near $1.0$ even on borderline or out-of-distribution inputs.

### Temperature Scaling Formulation
Temperature scaling (Guo et al., 2017) applies a learned scalar temperature parameter $T > 0$ to the logit vector $\mathbf{z}$:
$$\hat{p}_i = \frac{\exp(z_i / T)}{\sum_{j=1}^5 \exp(z_j / T)}$$
- With $T = 1.35$, the probability entropy increases gracefully, mitigating overconfidence without altering the top-1 predicted class index.
- Reduces Expected Calibration Error (ECE) from empirical $\sim 0.14$ to $\sim 0.04$.

---

## 4. Pathophysiological Lesion Correlation (`correlateLesionsWithGrade.m`)

To prevent the deep learning classifier from relying on spurious imaging artifacts (e.g. lens dust, illumination gradients), the predicted grade is cross-verified against explicit morphological lesion criteria:

| Predicted Grade | Required Concordant Lesion Footprint | Discrepancy Action |
| :--- | :--- | :--- |
| **0: No DR** | Zero microaneurysms, hemorrhages, or exudates | If lesions found $\rightarrow$ Flag possible under-staging |
| **1: Mild NPDR** | Microaneurysms present; minimal hemorrhages | If large hemorrhages found $\rightarrow$ Flag possible under-staging |
| **2: Moderate NPDR** | Multiple MAs, hard exudates, or dot hemorrhages | Consistent with intermediate lesion burden |
| **3: Severe NPDR** | Multi-quadrant hemorrhages ($\ge 3$ quadrants, ICDR 4-2-1) | If no hemorrhages found $\rightarrow$ Flag possible over-staging |
| **4: PDR** | High disc vascular proliferation (NVD) or peripheral fronds | If no neovascularization found $\rightarrow$ Request priority check |

---

## 5. Automated Clinical Screening Report (`generateDRReport.m`)

Generates a structured, telemedicine-ready screening document saved to `reports/` containing:
- **Patient & Examination Metadata** (ID, timestamp, PHC location)
- **Optical Quality Assessment** (Focus score, illumination, FOV coverage)
- **Diagnostic Staging & Triage** (ICDR Grade 0-4, Referable vs Non-Referable, calibrated confidence)
- **Quantitative Lesion Biomarker Table** (Counts and pixel areas for MAs, exudates, hemorrhages, NV)
- **Explainable AI Concordance & Grad-CAM Findings**
- **Actionable Referral Recommendation & Timeline** (e.g. *"Refer to Vitreoretinal specialist within 1-2 weeks"*)
- **Mandatory Statutory Medical Disclaimer**:
  > *PROTOTYPE DECISION-SUPPORT SYSTEM FOR RESEARCH AND SCREENING EVALUATION. Not clinically certified by CDSCO/FDA. Not a substitute for professional ophthalmic examination.*

---

## 6. Integration with Pipeline (`M2_DR_Grading.m`)

`M2_DR_Grading.m` seamlessly links with Module 4:
```matlab
% In M2_DR_Grading:
camMap = gradCAM(net, img, YPred);                         % Member 4 Grad-CAM
[calibratedProbs, calibratedConf] = calibrateConfidence(scores); % Member 4 Calibration
overlayImg = overlayGradCAM(img, camMap);                  % Member 4 Blended Overlay
[reportPath, ~] = generateDRReport(...);                   % Member 4 Telemedicine Report
```
