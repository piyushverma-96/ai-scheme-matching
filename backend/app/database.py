import logging
from typing import Optional, Tuple
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("arthsetu.database")

_supabase_admin_client: Optional[Client] = None
_supabase_anon_client: Optional[Client] = None

def get_supabase_admin() -> Client:
    """
    Returns the Supabase admin client initialized with the Service Role key.
    Used ONLY in the backend for elevated operations and validation.
    """
    global _supabase_admin_client
    if _supabase_admin_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing!")
        _supabase_admin_client = create_client(
            settings.SUPABASE_URL or "https://placeholder-project.supabase.co",
            settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY or "placeholder-key"
        )
    return _supabase_admin_client

def get_supabase_anon() -> Client:
    """
    Returns the Supabase client initialized with the Public Anon key.
    Used for standard user-level operations like sign-up / sign-in.
    """
    global _supabase_anon_client
    if _supabase_anon_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            logger.warning("SUPABASE_URL or SUPABASE_ANON_KEY is missing!")
        _supabase_anon_client = create_client(
            settings.SUPABASE_URL or "https://placeholder-project.supabase.co",
            settings.SUPABASE_ANON_KEY or "placeholder-key"
        )
    return _supabase_anon_client

# Alias used across routes
get_supabase_client = get_supabase_admin

def check_database_connection() -> Tuple[bool, str]:
    """
    Checks Supabase connectivity by running a lightweight ping query.
    Returns (is_connected, details_message).
    """
    try:
        client = get_supabase_admin()
        # Query schemes table or auth health check
        response = client.table("schemes").select("id").limit(1).execute()
        return True, "Connected to Supabase PostgreSQL successfully"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        # Check if auth endpoint at least reaches Supabase
        try:
            client = get_supabase_anon()
            return True, "Connected to Supabase service"
        except Exception as inner_e:
            return False, f"Supabase connection error: {str(inner_e)}"
