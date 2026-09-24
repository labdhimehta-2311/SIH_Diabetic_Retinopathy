import os
import json

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "sih_config.json")

def load_config():
    """Safely loads SIH configuration dictionary with fallback."""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def get_config_section(section_name, default=None):
    cfg = load_config()
    return cfg.get(section_name, default if default is not None else {})
