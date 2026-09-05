"""
ArthSetu AI — Rate Limiting & Security Middleware (Step 6)
===========================================================
Protects external AI services (Groq, Nominatim, OpenRouteService)
with an in-memory sliding window rate limiter.
"""

import time
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("arthsetu.rate_limit")

class SlidingWindowRateLimiter(BaseHTTPMiddleware):
    """
    Sliding-window in-memory rate limiter for specific endpoint prefixes.
    Applies per-client IP limits with standard X-RateLimit headers.
    """

    def __init__(
        self,
        app,
        limit_per_minute: int = 60,
        ai_limit_per_minute: int = 30,
    ):
        super().__init__(app)
        self.limit_per_minute = limit_per_minute
        self.ai_limit_per_minute = ai_limit_per_minute
        # Dict[client_ip, List[timestamp]]
        self._general_requests: Dict[str, List[float]] = defaultdict(list)
        self._ai_requests: Dict[str, List[float]] = defaultdict(list)

    def _clean_and_count(self, timestamps: List[float], window_seconds: float = 60.0) -> int:
        now = time.time()
        cutoff = now - window_seconds
        # Keep only timestamps in current window
        while timestamps and timestamps[0] < cutoff:
            timestamps.pop(0)
        return len(timestamps)

    async def dispatch(self, request: Request, call_next):
        # Identify client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        path = request.url.path
        now = time.time()

        # Check if route is an AI or Eligibility endpoint (heavier resource usage)
        is_ai_route = "/ai/" in path or path.endswith("/ai")

        if is_ai_route:
            timestamps = self._ai_requests[client_ip]
            current_count = self._clean_and_count(timestamps)
            max_limit = self.ai_limit_per_minute

            if current_count >= max_limit:
                logger.warning(f"AI rate limit exceeded for client {client_ip} on {path}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "RateLimitExceeded",
                        "message": "AI inquiry rate limit exceeded. Please wait a moment before sending more queries.",
                        "retry_after_seconds": 30,
                        "limit": max_limit,
                    },
                    headers={
                        "Retry-After": "30",
                        "X-RateLimit-Limit": str(max_limit),
                        "X-RateLimit-Remaining": "0",
                    },
                )
            timestamps.append(now)
            remaining = max(0, max_limit - len(timestamps))

            response: Response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(max_limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        return await call_next(request)
