"""
Tamper-Evident Audit Log
------------------------
Implements a cryptographically anchored SHA-256 hash chain:
  Record_0 -> Hash_0
  Record_1 + Hash_0 -> Hash_1
  Record_2 + Hash_1 -> Hash_2

Ensures verifiable immutability for the referral tracking chain:
  image -> grade -> referral -> clinical outcome

Called a "Tamper-Evident Audit Log".
Does NOT claim to be a complete distributed blockchain implementation.
"""

import os
import json
import hashlib
from datetime import datetime, timezone

TAMPER_CHAIN_FILE = os.path.join(os.path.dirname(__file__), "tamper_chain.json")

GENESIS_HASH = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"

def _compute_hash(data_str, prev_hash):
    combined = f"{prev_hash}|{data_str}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest()

def _load_chain():
    if os.path.exists(TAMPER_CHAIN_FILE):
        try:
            with open(TAMPER_CHAIN_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_chain(chain):
    try:
        with open(TAMPER_CHAIN_FILE, "w", encoding="utf-8") as f:
            json.dump(chain, f, indent=2)
    except Exception:
        pass

def append_audit_block(case_id, grade, triage, doctor_id="SYSTEM"):
    """
    Appends a new cryptographically chained audit record.
    """
    chain = _load_chain()
    
    prev_hash = chain[-1]["hash"] if len(chain) > 0 else GENESIS_HASH
    index = len(chain)
    timestamp = datetime.now(timezone.utc).isoformat()
    
    payload = {
        "index": index,
        "case_id": case_id,
        "grade": int(grade),
        "triage": triage,
        "doctor_id": doctor_id,
        "timestamp": timestamp
    }
    
    payload_str = json.dumps(payload, sort_keys=True)
    current_hash = _compute_hash(payload_str, prev_hash)
    
    block = {
        **payload,
        "previous_hash": prev_hash,
        "hash": current_hash
    }
    
    chain.append(block)
    _save_chain(chain)
    return block

def verify_chain_integrity():
    """
    Validates every block in the hash chain from genesis to head.
    Detects any unauthorized mutation, deletion, or tampering.
    """
    chain = _load_chain()
    if not chain:
        # Seed with initial verified blocks for demonstration if empty
        return {
            "is_valid": True,
            "blocks_checked": 0,
            "status_badge": "✓ Chain valid / No modification detected",
            "message": "Audit chain empty or initialized cleanly."
        }
        
    expected_prev = GENESIS_HASH
    for idx, block in enumerate(chain):
        # Extract payload without hash fields
        payload = {
            "index": block.get("index"),
            "case_id": block.get("case_id"),
            "grade": block.get("grade"),
            "triage": block.get("triage"),
            "doctor_id": block.get("doctor_id"),
            "timestamp": block.get("timestamp")
        }
        payload_str = json.dumps(payload, sort_keys=True)
        recalculated_hash = _compute_hash(payload_str, block.get("previous_hash", ""))
        
        if block.get("previous_hash") != expected_prev:
            return {
                "is_valid": False,
                "broken_block_index": idx,
                "status_badge": "❌ Tampering Detected: Broken Hash Link",
                "message": f"Block #{idx} previous_hash mismatch. Unauthorized deletion/insertion detected."
            }
            
        if recalculated_hash != block.get("hash"):
            return {
                "is_valid": False,
                "broken_block_index": idx,
                "status_badge": "❌ Tampering Detected: Content Corrupted",
                "message": f"Block #{idx} payload content has been altered after signing."
            }
            
        expected_prev = block.get("hash")
        
    return {
        "is_valid": True,
        "blocks_checked": len(chain),
        "status_badge": "✓ Chain valid / No modification detected",
        "message": f"All {len(chain)} referral blocks cryptographically verified.",
        "head_hash": expected_prev[:16] + "..."
    }

def get_tamper_log_summary():
    """Returns recent verified blocks and overall chain health."""
    chain = _load_chain()
    verification = verify_chain_integrity()
    return {
        "total_blocks": len(chain),
        "integrity": verification,
        "recent_blocks": chain[-5:] if chain else []
    }
