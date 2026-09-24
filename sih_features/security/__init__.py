"""
Tamper-Evident Audit Log Module
"""
from .tamper_log import append_audit_block, verify_chain_integrity, get_tamper_log_summary

__all__ = ["append_audit_block", "verify_chain_integrity", "get_tamper_log_summary"]
