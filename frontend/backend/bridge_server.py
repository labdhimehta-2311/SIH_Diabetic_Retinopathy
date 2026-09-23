from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import matlab.engine
import tempfile
import os
import json
import shutil

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

@app.post("/infer")
async def run_inference(
    image: UploadFile = File(...),
    check_M3_setup: str = Form("true")
):
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
            # Move images to the public folder and return lightweight URLs
            result_dict["images"] = {
                "originalUrl": move_to_public(tmp_path),
                "enhancedUrl": move_to_public(result_dict.pop("enhancedPath", None)),
                "heatmapUrl": move_to_public(result_dict.pop("heatmapPath", None)),
                "lesionMaskUrl": move_to_public(result_dict.pop("lesionMaskPath", None))
            }

        return result_dict
    except Exception as e:
        return {"success": False, "error": str(e)}
    # Note: tmp_path is deliberately NOT deleted here because move_to_public() relocates it.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)