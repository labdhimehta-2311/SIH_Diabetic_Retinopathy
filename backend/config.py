import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    SAMPLES_FOLDER = os.path.join(BASE_DIR, 'samples')
    MATLAB_SCRIPTS_DIR = os.path.join(BASE_DIR, 'matlab')
    
    # Allowed extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tif', 'tiff', 'bmp'}
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32 MB max
    
    # MATLAB settings
    MATLAB_APP_PATH = '/Applications/MATLAB_R2026a.app'
    ENABLE_MATLAB_FALLBACK = True  # Fallback to high-fidelity CV/AI simulation if engine not initialized
    
    PORT = int(os.environ.get('PORT', 5001))
    DEBUG = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.SAMPLES_FOLDER, exist_ok=True)
