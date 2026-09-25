\# R4 Multilabel U-Net Evaluation



\## Overview



R4 is an experimental multilabel U-Net segmentation model for five

IDRiD segmentation classes:



1\. Microaneurysms (MA)

2\. Haemorrhages (HE)

3\. Hard Exudates (EX)

4\. Soft Exudates (SE)

5\. Optic Disc (OD)



\## Model Verification



The verified R4 model is:



`R4\_multilabel\_unet\_FINAL.mat`



The verified class order is:



`MA, HE, EX, SE, OD`



The model accepts 512 x 512 RGB images and produces a

512 x 512 x 5 output.



\## Evaluation



R4 was tested on:



`data/samples/sample\_grade0\_normal.png`



The raw outputs were confirmed to be logits and were converted to

probabilities using sigmoid.



At a diagnostic threshold of 0.50:



| Class | Positive pixels | Image percentage |

|---|---:|---:|

| MA | 1,281 | 0.489% |

| HE | 136,996 | 52.260% |

| EX | 1,289 | 0.492% |

| SE | 5,054 | 1.928% |

| OD | 109,705 | 41.849% |



The probability maps showed broad activation patterns, particularly

for HE and OD.



\## Integration Status



R4 is currently treated as an experimental segmentation model.



It is not enabled as the production M3 segmentation model.



The existing `M3\_Segmentation\_Interface.m` remains unchanged so that

the existing M4/M5/M6 pipeline contract is preserved.



Future R4 integration should use a separate interface or adapter

compatible with the existing M3 output structure.



\## Current Decision



Keep the existing M3 model as the production segmentation model.



Keep R4 available as an experimental multilabel U-Net for further

development and evaluation.

