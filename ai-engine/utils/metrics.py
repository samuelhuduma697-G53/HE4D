"""
Metrics Collection for AI Engine Performance Monitoring
"""

import time
import statistics
from collections import deque
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collect and report performance metrics"""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.request_times = deque(maxlen=max_history)
        self.error_counts = deque(maxlen=max_history)
        self.request_counts = 0
        self.start_time = time.time()
    
    def record_request_time(self, duration_ms: float):
        """Record request processing time"""
        self.request_times.append(duration_ms)
        self.request_counts += 1
    
    def record_error(self):
        """Record an error occurrence"""
        self.error_counts.append(1)
    
    def get_average_response_time(self) -> float:
        """Get average response time in milliseconds"""
        if not self.request_times:
            return 0.0
        return statistics.mean(self.request_times)
    
    def get_percentile_response_time(self, percentile: float = 95) -> float:
        """Get percentile response time"""
        if not self.request_times:
            return 0.0
        sorted_times = sorted(self.request_times)
        index = int(len(sorted_times) * percentile / 100)
        return sorted_times[min(index, len(sorted_times) - 1)]
    
    def get_error_rate(self) -> float:
        """Get error rate as percentage"""
        if self.request_counts == 0:
            return 0.0
        return (len(self.error_counts) / self.request_counts) * 100
    
    def get_throughput(self, window_seconds: int = 60) -> float:
        """Get requests per second"""
        # Simplified throughput calculation
        return self.request_counts / max(1, (time.time() - self.start_time))
    
    def get_metrics(self) -> Dict:
        """Get all metrics as dictionary"""
        return {
            'total_requests': self.request_counts,
            'avg_response_time_ms': round(self.get_average_response_time(), 2),
            'p95_response_time_ms': round(self.get_percentile_response_time(95), 2),
            'p99_response_time_ms': round(self.get_percentile_response_time(99), 2),
            'error_rate_percent': round(self.get_error_rate(), 2),
            'throughput_rps': round(self.get_throughput(), 2),
            'uptime_seconds': round(time.time() - self.start_time, 0)
        }

# Global metrics instance
metrics = MetricsCollector()

def track_request_time(func):
    """Decorator to track request processing time"""
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            duration = (time.time() - start) * 1000
            metrics.record_request_time(duration)
            return result
        except Exception as e:
            metrics.record_error()
            raise e
    return wrapper