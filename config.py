import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("[WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.")

def get_supabase_client() -> Client:
    """Creates and returns an authenticated Supabase client using the service role key."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

