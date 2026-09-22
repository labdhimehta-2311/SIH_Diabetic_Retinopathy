from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import matlab.engine
import tempfile
import os
import json
import shutil
import cv2
import numpy as np
import time  # <-- NEW: Imported for latency tracking

app = FastAPI(title="RetinX MATLAB Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Starting persistent MATLAB engine... (This takes 15-30s once)")
eng = matlab.engine.start_matlab()
eng.addpath(r"/Users/mrudangmrugeshshah/Desktop/SIH_Diabetic_Retinopathy-main", nargout=0)
print("MATLAB engine ready for real-time inference.")

# Define the Next.js public directory to act as our local "Cloud Storage Bucket"
FRONTEND_PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "scans"))
os.makedirs(FRONTEND_PUBLIC_DIR, exist_ok=True)

def move_to_public(filepath):
    """Moves temp images into the Next.js public folder and returns a web URL."""
    if filepath and os.path.exists(filepath):
        filename = os.path.basename(filepath)
        dest_path = os.path.join(FRONTEND_PUBLIC_DIR, filename)
        shutil.move(filepath, dest_path)
        return f"/scans/{filename}"
    return None

def generate_confidence_map(mask_path):
    """
    Transforms a flat grayscale U-Net probability mask into a 
    clinical confidence map (Blue=Low, Orange=Medium, White=High).
    """
    if not mask_path or not os.path.exists(mask_path):
        return
    
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        return
        
    colored_mask = np.zeros((mask.shape[0], mask.shape[1], 3), dtype=np.uint8)
    colored_mask[(mask >= 127) & (mask <= 178)] = [255, 144, 30] 
    colored_mask[(mask >= 179) & (mask <= 229)] = [0, 140, 255]
    colored_mask[mask >= 230] = [255, 255, 255]

    cv2.imwrite(mask_path, colored_mask)

@app.post("/infer")
async def run_inference(
    image: UploadFile = File(...),
    check_M3_setup: str = Form("true")
):
    # 1. START THE CLOCK
    start_time = time.time()

    run_m3_bool = check_M3_setup.lower() == "true"
    
    # Save uploaded image
    suffix = os.path.splitext(image.filename)[1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        tmp_path = tmp.name

    try:
        raw_result = eng.run_retina_pipeline(tmp_path, run_m3_bool)
        result_dict = json.loads(raw_result)

        if result_dict.get("success"):
            # Extract paths returned by MATLAB
            enhanced_path = result_dict.pop("enhancedPath", None)
            heatmap_path = result_dict.pop("heatmapPath", None)
            lesion_mask_path = result_dict.pop("lesionMaskPath", None)
            
            # --- Multi-Color U-Net Confidence Map Injection ---
            generate_confidence_map(lesion_mask_path)
            
            # --- OpenCV Vibrant Grad-CAM Injection ---
            if heatmap_path and os.path.exists(heatmap_path) and enhanced_path and os.path.exists(enhanced_path):
                base_img = cv2.imread(enhanced_path) 
                raw_heatmap = cv2.imread(heatmap_path, cv2.IMREAD_GRAYSCALE)
                
                if base_img is not None and raw_heatmap is not None:
                    raw_heatmap = cv2.resize(raw_heatmap, (base_img.shape[1], base_img.shape[0]))
                    colored_heatmap = cv2.applyColorMap(raw_heatmap, cv2.COLORMAP_JET)
                    superimposed_img = cv2.addWeighted(colored_heatmap, 0.5, base_img, 0.7, 0)
                    cv2.imwrite(heatmap_path, superimposed_img)

            # Move images to the public folder and return lightweight URLs
            result_dict["images"] = {
                "originalUrl": move_to_public(tmp_path),
                "enhancedUrl": move_to_public(enhanced_path),
                "heatmapUrl": move_to_public(heatmap_path),
                "lesionMaskUrl": move_to_public(lesion_mask_path)
            }

            # 2. STOP THE CLOCK AND RECORD LATENCY
            end_time = time.time()
            result_dict["latency_ms"] = round((end_time - start_time) * 1000, 2)

        return result_dict
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)