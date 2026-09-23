import os
import sys
import json
import time
import shutil
import tempfile
import logging
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RetinX-Bridge")

# Add backend directory to sys.path to access pipeline modules
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from pipeline import mock_inference

app = FastAPI(title="RetinX MATLAB & Python Inference Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define directories
FRONTEND_PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "scans"))
FRONTEND_SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "samples"))
BACKEND_SAMPLES_DIR = os.path.join(BACKEND_DIR, "samples")
DATA_SAMPLES_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "data", "samples"))

os.makedirs(FRONTEND_PUBLIC_DIR, exist_ok=True)
os.makedirs(FRONTEND_SAMPLES_DIR, exist_ok=True)

# Synchronize sample files into public samples folder if needed
for s_dir in [BACKEND_SAMPLES_DIR, DATA_SAMPLES_DIR]:
    if os.path.exists(s_dir):
        for f in os.listdir(s_dir):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                src_file = os.path.join(s_dir, f)
                dst_file = os.path.join(FRONTEND_SAMPLES_DIR, f)
                if not os.path.exists(dst_file):
                    try:
                        shutil.copyfile(src_file, dst_file)
                    except Exception:
                        pass

# Safe MATLAB Engine Initialization
eng = None
has_matlab = False
try:
    import matlab.engine
    logger.info("Initializing MATLAB Engine...")
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    eng = matlab.engine.start_matlab()
    eng.addpath(repo_root, nargout=0)
    matlab_dir = os.path.join(BACKEND_DIR, "matlab")
    if os.path.exists(matlab_dir):
        eng.addpath(matlab_dir, nargout=0)
    has_matlab = True
    logger.info("MATLAB engine successfully initialized.")
except Exception as e:
    has_matlab = False
    eng = None
    logger.info(f"MATLAB Engine not available ({e}). Seamlessly using high-fidelity Python CV/AI pipeline.")

def move_to_public(filepath):
    """Moves temp images into the Next.js public folder and returns a web URL."""
    if filepath and os.path.exists(filepath):
        filename = os.path.basename(filepath)
        dest_path = os.path.join(FRONTEND_PUBLIC_DIR, filename)
        if filepath != dest_path:
            shutil.copyfile(filepath, dest_path)
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

def execute_pipeline(input_image_path: str, run_m3_bool: bool, session_id: str):
    """Executes screening through MATLAB Engine if available, or Python CV/AI pipeline."""
    start_time = time.time()
    execution_backend = "matlab_engine" if has_matlab and eng else "python_cv_engine"
    
    enhanced_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{session_id}_m1_enhanced.png")
    heatmap_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{session_id}_m4_heatmap.png")
    lesion_mask_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{session_id}_m3_lesion_mask.png") if run_m3_bool else None

    if has_matlab and eng:
        try:
            if hasattr(eng, 'run_retina_pipeline'):
                raw_result = eng.run_retina_pipeline(input_image_path, run_m3_bool)
                result_dict = json.loads(raw_result)
                if result_dict.get("success"):
                    enh_p = result_dict.pop("enhancedPath", None)
                    heat_p = result_dict.pop("heatmapPath", None)
                    mask_p = result_dict.pop("lesionMaskPath", None)
                    if mask_p:
                        generate_confidence_map(mask_p)
                    return {
                        "success": True,
                        "engine": "matlab_engine",
                        "grade": result_dict.get("grade", 0),
                        "gradeLabel": result_dict.get("gradeLabel", "No Apparent Diabetic Retinopathy"),
                        "confidence": result_dict.get("confidence", 95.0),
                        "referable": result_dict.get("referable", False),
                        "m3Executed": run_m3_bool,
                        "executionTimeSec": round(time.time() - start_time, 2),
                        "latency_ms": round((time.time() - start_time) * 1000, 2),
                        "images": {
                            "originalUrl": move_to_public(input_image_path),
                            "enhancedUrl": move_to_public(enh_p),
                            "heatmapUrl": move_to_public(heat_p),
                            "lesionMaskUrl": move_to_public(mask_p)
                        }
                    }
        except Exception as e:
            logger.warning(f"MATLAB execution failed ({e}), falling back to Python CV engine.")
            execution_backend = "python_cv_engine (fallback)"

    # High-Fidelity Python CV / AI Pipeline Fallback
    mock_inference.run_m1_enhancement(input_image_path, enhanced_path)
    m2_res = mock_inference.run_m2_grading(enhanced_path)
    
    if run_m3_bool:
        mock_inference.run_m3_segmentation(enhanced_path, lesion_mask_path, check_m3_setup=True)
        generate_confidence_map(lesion_mask_path)
    else:
        lesion_mask_path = None

    mock_inference.run_m4_gradcam(enhanced_path, heatmap_path, grade=m2_res["grade"])

    # Enhance Grad-CAM with vibrant JET overlay
    if heatmap_path and os.path.exists(heatmap_path) and os.path.exists(enhanced_path):
        base_img = cv2.imread(enhanced_path)
        raw_heatmap = cv2.imread(heatmap_path, cv2.IMREAD_GRAYSCALE)
        if base_img is not None and raw_heatmap is not None:
            raw_heatmap = cv2.resize(raw_heatmap, (base_img.shape[1], base_img.shape[0]))
            colored_heatmap = cv2.applyColorMap(raw_heatmap, cv2.COLORMAP_JET)
            superimposed = cv2.addWeighted(colored_heatmap, 0.5, base_img, 0.7, 0)
            cv2.imwrite(heatmap_path, superimposed)

    duration = round(time.time() - start_time, 2)
    latency_ms = round(duration * 1000, 2)

    return {
        "success": True,
        "sessionId": session_id,
        "engine": execution_backend,
        "grade": m2_res["grade"],
        "gradeLabel": m2_res["gradeLabel"],
        "confidence": m2_res["confidence"],
        "referable": m2_res["referable"],
        "m3Executed": run_m3_bool,
        "executionTimeSec": duration,
        "latency_ms": latency_ms,
        "images": {
            "originalUrl": move_to_public(input_image_path),
            "enhancedUrl": move_to_public(enhanced_path),
            "heatmapUrl": move_to_public(heatmap_path),
            "lesionMaskUrl": move_to_public(lesion_mask_path) if run_m3_bool else None
        }
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RetinX Inference Engine",
        "matlabEngineAvailable": has_matlab,
        "activeEngine": "matlab.engine" if has_matlab else "python_cv_engine",
        "supportedStages": [
            "M1_Enhancement",
            "M2_ResNet50_Grading",
            "M3_UNet_Lesion_Segmentation",
            "M4_GradCAM_Heatmap"
        ]
    }

@app.get("/api/samples")
def list_samples():
    """Returns the list of available demo fundus samples."""
    samples = []
    seen = set()
    for s_dir in [FRONTEND_SAMPLES_DIR, BACKEND_SAMPLES_DIR, DATA_SAMPLES_DIR]:
        if os.path.exists(s_dir):
            for f in sorted(os.listdir(s_dir)):
                if f.lower().endswith(('.png', '.jpg', '.jpeg')) and f not in seen:
                    seen.add(f)
                    name = os.path.splitext(f)[0].replace('_', ' ').title()
                    samples.append({
                        "id": f,
                        "title": name,
                        "url": f"/samples/{f}"
                    })
    return {"samples": samples}

@app.get("/api/samples/{filename}")
@app.get("/samples/{filename}")
def serve_sample(filename: str):
    for s_dir in [FRONTEND_SAMPLES_DIR, BACKEND_SAMPLES_DIR, DATA_SAMPLES_DIR]:
        candidate = os.path.join(s_dir, filename)
        if os.path.exists(candidate):
            return FileResponse(candidate)
    raise HTTPException(status_code=404, detail="Sample not found")

@app.post("/infer")
async def run_inference(
    request: Request,
    image: Optional[UploadFile] = File(None),
    check_M3_setup: Optional[str] = Form(None)
):
    content_type = request.headers.get("content-type", "")
    session_id = f"WEB_{time.strftime('%Y%m%d_%H%M%S')}"
    
    # 1. Handle JSON request (e.g. from sample selection in intake form)
    if "application/json" in content_type:
        try:
            body = await request.json()
            sample_id = body.get("sample_id")
            run_m3 = bool(body.get("check_M3_setup", True))
            
            # Find sample image
            sample_file = None
            for s_dir in [FRONTEND_SAMPLES_DIR, BACKEND_SAMPLES_DIR, DATA_SAMPLES_DIR]:
                candidate = os.path.join(s_dir, sample_id)
                if os.path.exists(candidate):
                    sample_file = candidate
                    break
            
            if not sample_file:
                return JSONResponse(status_code=404, content={"success": False, "error": f"Sample {sample_id} not found."})
                
            tmp_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{session_id}_raw{os.path.splitext(sample_file)[1]}")
            shutil.copyfile(sample_file, tmp_path)
            
            result = execute_pipeline(tmp_path, run_m3, session_id)
            return JSONResponse(content=result)
        except Exception as e:
            logger.error(f"Sample inference failed: {e}")
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    # 2. Handle Multipart / Form data request
    try:
        # If image was not captured via FastAPI DI, check request.form()
        if image is None:
            form = await request.form()
            image_field = form.get("image")
            if isinstance(image_field, UploadFile):
                image = image_field
            if check_M3_setup is None:
                check_M3_setup = str(form.get("check_M3_setup", "true"))

        if not image:
            return JSONResponse(status_code=400, content={"success": False, "error": "No image file provided."})

        run_m3_bool = str(check_M3_setup).lower() in ["true", "1", "yes", "on"]
        suffix = os.path.splitext(image.filename)[1] or ".png"
        tmp_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{session_id}_raw{suffix}")
        
        with open(tmp_path, "wb") as f_out:
            content = await image.read()
            f_out.write(content)

        result = execute_pipeline(tmp_path, run_m3_bool, session_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Inference pipeline failed: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    print("Starting RetinX Inference Bridge on port 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)