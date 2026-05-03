"""
API package for AI Engine
"""

from api.triage_routes import triage_bp
from api.health_routes import health_bp
from api.safety_routes import safety_bp

__all__ = ['triage_bp', 'health_bp', 'safety_bp']