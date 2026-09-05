import math
from fastapi import HTTPException

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes geographical distance in kilometers between two coordinates
    using the Haversine formula (Earth radius R = 6371 km).
    """
    R = 6371.0  # Earth's radius in km

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lon / 2.0) ** 2)
    # Clamp to handle numerical float approximations
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def handle_db_error(e: Exception):
    """Logs internal error details on server and raises a clean 502 response."""
    print(f"[DATABASE_ERROR] {type(e).__name__}: {str(e)}")
    raise HTTPException(
        status_code=502,
        detail="Database temporarily unavailable. Please try again shortly."
    )
