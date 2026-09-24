#!/usr/bin/env python3
"""
=============================================================================
 APTOS 2019 DIABETIC RETINOPATHY - 5-EPOCH M2 RESNET-50 FINE-TUNING PIPELINE
=============================================================================
Fine-tunes the M2 ResNet-50 model on the balanced APTOS 2019 dataset
(100 images per DR grade, 500 images total) for 5 epochs.
Utilizes differential learning rates on Layer 4 and the classification head
along with data augmentation to elevate multi-class prediction accuracy.
=============================================================================
"""

import os
import sys
import glob
import time
import json
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, cohen_kappa_score
)

# -------------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, "reports", "aptos_images")
MODEL_PATH = os.path.join(BASE_DIR, "backend", "pipeline", "m2_resnet50_aptos.pth")
METRICS_PATH = os.path.join(BASE_DIR, "backend", "pipeline", "m2_dr_model.json")

BATCH_SIZE = 16
NUM_EPOCHS = 5
RANDOM_SEED = 42

# Ensure reproducible split
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

GRADE_LABELS = {
    0: "No Apparent Diabetic Retinopathy",
    1: "Mild Non-Proliferative Diabetic Retinopathy",
    2: "Moderate Non-Proliferative Diabetic Retinopathy",
    3: "Severe Non-Proliferative Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy"
}


# -------------------------------------------------------------------------
# Dataset Class with Data Augmentation
# -------------------------------------------------------------------------
class AptosDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, torch.tensor(label, dtype=torch.long)


def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    return train_transform, val_transform


# -------------------------------------------------------------------------
# Model Setup with Differential Unfreezing
# -------------------------------------------------------------------------
def setup_model(model_path):
    print(f"\n[1/5] Loading M2 ResNet-50 checkpoint from: {model_path}")
    device = torch.device("cpu")

    model = torch.load(model_path, map_location=device, weights_only=False)
    if hasattr(model, 'float'):
        model = model.float()
    
    # Freeze lower conv layers (layers 1 to 3)
    for name, param in model.named_parameters():
        if "layer4" in name or "fc" in name:
            param.requires_grad = True
        else:
            param.requires_grad = False

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    frozen_params = sum(p.numel() for p in model.parameters() if not p.requires_grad)
    print(f"      Trainable Parameters (Layer 4 + FC Head): {trainable_params:,}")
    print(f"      Frozen Parameters (Layers 1-3):           {frozen_params:,}")

    return model, device


# -------------------------------------------------------------------------
# Training & Validation Loops
# -------------------------------------------------------------------------
def train_and_evaluate():
    start_time = time.time()
    print("=" * 75)
    print(" STARTING M2 RESNET-50 5-EPOCH FINE-TUNING ON APTOS 2019 DATASET")
    print("=" * 75)

    # 1. Gather all cached APTOS images
    img_files = sorted(glob.glob(os.path.join(IMAGE_DIR, "*.jpg")))
    if len(img_files) < 100:
        print(f"Error: Found only {len(img_files)} images in {IMAGE_DIR}. Need 500.")
        sys.exit(1)

    labels = [int(os.path.basename(f).split("_")[1][1]) for f in img_files]
    print(f"[2/5] Loaded {len(img_files)} images across 5 balanced classes (100 per grade).")

    # 2. Stratified train/val split (80% train = 400 images, 20% val = 100 images)
    train_files, val_files, train_labels, val_labels = train_test_split(
        img_files, labels, test_size=0.2, random_state=RANDOM_SEED, stratify=labels
    )
    print(f"      Training set:   {len(train_files)} images (80 per class)")
    print(f"      Validation set: {len(val_files)} images (20 per class)")

    train_tf, val_tf = get_transforms()
    train_dataset = AptosDataset(train_files, train_labels, transform=train_tf)
    val_dataset = AptosDataset(val_files, val_labels, transform=val_tf)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    # 3. Model, Optimizer, Loss, Scheduler
    model, device = setup_model(MODEL_PATH)

    # Differential learning rates: smaller lr for layer4, larger lr for classification head
    optimizer = torch.optim.AdamW([
        {"params": model.layer4.parameters(), "lr": 8e-5, "weight_decay": 1e-4},
        {"params": model.fc.parameters(), "lr": 6e-4, "weight_decay": 1e-4}
    ])
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS, eta_min=1e-6)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.08)

    best_val_qwk = -1.0
    best_val_acc = 0.0
    history = []

    print("\n[3/5] Executing 5 Fine-Tuning Epochs:")
    print("-" * 75)

    for epoch in range(1, NUM_EPOCHS + 1):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * batch_x.size(0)
            preds = outputs.argmax(dim=1)
            correct_train += (preds == batch_y).sum().item()
            total_train += batch_x.size(0)

        scheduler.step()
        train_loss = running_loss / total_train
        train_acc = correct_train / total_train

        # Validation Phase
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_targets = []

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                val_loss += loss.item() * batch_x.size(0)

                preds = outputs.argmax(dim=1)
                all_preds.extend(preds.cpu().numpy())
                all_targets.extend(batch_y.cpu().numpy())

        val_loss /= len(val_dataset)
        val_acc = accuracy_score(all_targets, all_preds)
        val_qwk = cohen_kappa_score(all_targets, all_preds, weights="quadratic")

        # Referable DR metrics (Grade >= 2)
        ref_targets = [y >= 2 for y in all_targets]
        ref_preds = [p >= 2 for p in all_preds]
        ref_acc = accuracy_score(ref_targets, ref_preds)
        ref_sens = recall_score(ref_targets, ref_preds, zero_division=0)
        ref_spec = recall_score([not y for y in ref_targets], [not p for p in ref_preds], zero_division=0)

        epoch_time = time.time() - epoch_start
        print(f" Epoch {epoch}/{NUM_EPOCHS} ({epoch_time:.1f}s) | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc*100:.1f}% | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc*100:.1f}% | "
              f"Referable: {ref_acc*100:.1f}% | QWK: {val_qwk:.4f}")

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc * 100.0, 2),
            "val_loss": round(val_loss, 4),
            "val_top1_acc": round(val_acc * 100.0, 2),
            "val_referable_acc": round(ref_acc * 100.0, 2),
            "val_qwk": round(float(val_qwk), 4),
            "val_sensitivity": round(ref_sens * 100.0, 2),
            "val_specificity": round(ref_spec * 100.0, 2)
        })

        if val_qwk > best_val_qwk:
            best_val_qwk = val_qwk
            best_val_acc = val_acc
            # Save best checkpoint
            torch.save(model, MODEL_PATH)

    print("-" * 75)
    print(f" Best Validation QWK: {best_val_qwk:.4f} (Top-1 Accuracy: {best_val_acc*100:.1f}%)")
    print(f" Saved fine-tuned checkpoint to: {MODEL_PATH}")

    # 4. Final Comprehensive Evaluation Benchmark
    print("\n[4/5] Computing Post-Training Evaluation Benchmarks:")
    model = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    model.eval()

    final_preds = []
    final_targets = []
    with torch.no_grad():
        for batch_x, batch_y in val_loader:
            batch_x = batch_x.to(device)
            outputs = model(batch_x)
            preds = outputs.argmax(dim=1)
            final_preds.extend(preds.cpu().numpy())
            final_targets.extend(batch_y.numpy())

    final_acc = accuracy_score(final_targets, final_preds)
    final_qwk = cohen_kappa_score(final_targets, final_preds, weights="quadratic")
    final_cm = confusion_matrix(final_targets, final_preds)

    ref_targets = [y >= 2 for y in final_targets]
    ref_preds = [p >= 2 for p in final_preds]
    final_ref_acc = accuracy_score(ref_targets, ref_preds)
    final_sens = recall_score(ref_targets, ref_preds, zero_division=0)
    final_spec = recall_score([not y for y in ref_targets], [not p for p in ref_preds], zero_division=0)

    target_names = [f"Grade {i} ({GRADE_LABELS[i].split()[0]})" for i in range(5)]
    report_dict = classification_report(final_targets, final_preds, target_names=target_names, output_dict=True)
    report_str = classification_report(final_targets, final_preds, target_names=target_names)

    print("\n" + report_str)
    print("Confusion Matrix (5x5):")
    print("      Pred 0  Pred 1  Pred 2  Pred 3  Pred 4")
    for i, row in enumerate(final_cm):
        print(f"True {i}:  " + "   ".join(f"{v:5d}" for v in row))

    # 5. Update Metadata JSON
    print(f"\n[5/5] Updating Model Metadata in: {METRICS_PATH}")
    metadata = {
        "model_architecture": "ResNet-50",
        "input_resolution": [224, 224, 3],
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        },
        "dataset": "Kaggle APTOS 2019 Blindness Detection",
        "fine_tuning": {
            "completed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "epochs": NUM_EPOCHS,
            "batch_size": BATCH_SIZE,
            "train_samples": len(train_files),
            "val_samples": len(val_files),
            "differential_lr": {"layer4": 8e-5, "fc": 6e-4},
            "loss_function": "CrossEntropyLoss(label_smoothing=0.08)",
            "optimizer": "AdamW(weight_decay=1e-4)",
            "epoch_history": history
        },
        "metrics": {
            "top1_accuracy": round(final_acc * 100.0, 2),
            "referable_accuracy": round(final_ref_acc * 100.0, 2),
            "sensitivity": round(final_sens * 100.0, 2),
            "specificity": round(final_spec * 100.0, 2),
            "quadratic_weighted_kappa": round(float(final_qwk), 4),
            "target_referable_accuracy": 90.0,
            "referable_threshold_grade": 2
        },
        "per_class_metrics": {
            str(i): {
                "label": GRADE_LABELS[i],
                "precision": round(report_dict[target_names[i]]["precision"] * 100.0, 2),
                "recall": round(report_dict[target_names[i]]["recall"] * 100.0, 2),
                "f1_score": round(report_dict[target_names[i]]["f1-score"] * 100.0, 2),
                "support": int(report_dict[target_names[i]]["support"])
            }
            for i in range(5)
        },
        "confusion_matrix": final_cm.tolist()
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    elapsed = time.time() - start_time
    print(f"\n FINE-TUNING AND BENCHMARKING COMPLETED IN {elapsed:.2f} SECONDS")
    print("=" * 75)


if __name__ == "__main__":
    train_and_evaluate()
