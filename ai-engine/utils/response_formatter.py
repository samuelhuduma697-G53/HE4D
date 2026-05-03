"""
Response Formatting Utilities
"""

from typing import Dict, Any, List
from datetime import datetime

class ResponseFormatter:
    """Format API responses consistently"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Success") -> Dict:
        """Format success response"""
        return {
            'success': True,
            'message': message,
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def error(message: str, code: str = "ERROR", details: Any = None) -> Dict:
        """Format error response"""
        return {
            'success': False,
            'error': message,
            'code': code,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def paginated(data: List[Any], page: int, limit: int, total: int) -> Dict:
        """Format paginated response"""
        return {
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit if total > 0 else 0
            },
            'timestamp': datetime.now().isoformat()
        }