import os
import uuid
import base64
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from pipeline.matlab_bridge import MatlabPipelineBridge

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "*"}})

bridge = MatlabPipelineBridge(scripts_dir=Config.MATLAB_SCRIPTS_DIR)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Diabetic Retinopathy Screening Inference Engine",
        "matlabEngineAvailable": bridge.has_matlab,
        "activeEngine": "matlab.engine" if bridge.has_matlab else "python_cv_engine",
        "supportedStages": ["M1_Enhancement", "M2_ResNet50_Grading", "M3_UNet_Lesion_Segmentation", "M4_GradCAM_Heatmap"]
    })

@app.route('/api/files/<path:filename>', methods=['GET'])
def serve_file(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

@app.route('/api/samples/<path:filename>', methods=['GET'])
def serve_sample(filename):
    return send_from_directory(Config.SAMPLES_FOLDER, filename)

@app.route('/api/samples', methods=['GET'])
def list_samples():
    samples = []
    if os.path.exists(Config.SAMPLES_FOLDER):
        for f in sorted(os.listdir(Config.SAMPLES_FOLDER)):
            if allowed_file(f):
                name = os.path.splitext(f)[0].replace('_', ' ').title()
                samples.append({
                    "id": f,
                    "title": name,
                    "url": f"/api/samples/{f}"
                })
    return jsonify({"samples": samples})

@app.route('/api/screen', methods=['POST'])
def run_screening():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided in multipart request"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Selected file is empty"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {Config.ALLOWED_EXTENSIONS}"}), 400
    
    session_id = str(uuid.uuid4())[:8]
    ext = file.filename.rsplit('.', 1)[1].lower()
    raw_filename = f"{session_id}_raw.{ext}"
    raw_filepath = os.path.join(Config.UPLOAD_FOLDER, raw_filename)
    file.save(raw_filepath)
    
    check_m3_str = request.form.get('check_M3_setup', 'true').lower()
    check_m3_setup = (check_m3_str in ['true', '1', 'yes', 'on'])
    
    patient_id = request.form.get('patient_id', 'unknown')
    doctor_id = request.form.get('doctor_id', 'unknown')
    
    # Run pipeline
    pipeline_result = bridge.run_screening_pipeline(
        input_image_path=raw_filepath,
        output_dir=Config.UPLOAD_FOLDER,
        session_id=session_id,
        check_m3_setup=check_m3_setup
    )
    
    # Construct accessible URLs
    raw_url = f"/api/files/{raw_filename}"
    enhanced_url = f"/api/files/{session_id}_m1_enhanced.png"
    heatmap_url = f"/api/files/{session_id}_m4_heatmap.png"
    lesion_mask_url = f"/api/files/{session_id}_m3_lesion_mask.png" if pipeline_result.get("m3Executed") else None
    
    response_data = {
        "sessionId": session_id,
        "patientId": patient_id,
        "doctorId": doctor_id,
        "success": True,
        "engine": pipeline_result["engine"],
        "grade": pipeline_result["grade"],
        "gradeLabel": pipeline_result["gradeLabel"],
        "confidence": pipeline_result["confidence"],
        "referable": pipeline_result["referable"],
        "m3Executed": pipeline_result["m3Executed"],
        "executionTimeSec": pipeline_result["executionTimeSec"],
        "images": {
            "originalUrl": raw_url,
            "enhancedUrl": enhanced_url,
            "heatmapUrl": heatmap_url,
            "lesionMaskUrl": lesion_mask_url
        }
    }
    
    return jsonify(response_data)

@app.route('/api/screen-sample', methods=['POST'])
def screen_sample():
    data = request.get_json() or {}
    sample_id = data.get('sample_id')
    if not sample_id:
        return jsonify({"error": "sample_id required"}), 400
        
    sample_path = os.path.join(Config.SAMPLES_FOLDER, secure_filename(sample_id))
    if not os.path.exists(sample_path):
        return jsonify({"error": "Sample file not found"}), 404
        
    session_id = str(uuid.uuid4())[:8]
    ext = sample_id.rsplit('.', 1)[1].lower()
    raw_filename = f"{session_id}_raw.{ext}"
    raw_filepath = os.path.join(Config.UPLOAD_FOLDER, raw_filename)
    
    # Copy sample to uploads
    import shutil
    shutil.copyfile(sample_path, raw_filepath)
    
    check_m3_setup = bool(data.get('check_M3_setup', True))
    
    pipeline_result = bridge.run_screening_pipeline(
        input_image_path=raw_filepath,
        output_dir=Config.UPLOAD_FOLDER,
        session_id=session_id,
        check_m3_setup=check_m3_setup
    )
    
    raw_url = f"/api/files/{raw_filename}"
    enhanced_url = f"/api/files/{session_id}_m1_enhanced.png"
    heatmap_url = f"/api/files/{session_id}_m4_heatmap.png"
    lesion_mask_url = f"/api/files/{session_id}_m3_lesion_mask.png" if pipeline_result.get("m3Executed") else None
    
    return jsonify({
        "sessionId": session_id,
        "success": True,
        "engine": pipeline_result["engine"],
        "grade": pipeline_result["grade"],
        "gradeLabel": pipeline_result["gradeLabel"],
        "confidence": pipeline_result["confidence"],
        "referable": pipeline_result["referable"],
        "m3Executed": pipeline_result["m3Executed"],
        "executionTimeSec": pipeline_result["executionTimeSec"],
        "images": {
            "originalUrl": raw_url,
            "enhancedUrl": enhanced_url,
            "heatmapUrl": heatmap_url,
            "lesionMaskUrl": lesion_mask_url
        }
    })

if __name__ == '__main__':
    port = Config.PORT
    print(f"Starting Diabetic Retinopathy Screening Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
