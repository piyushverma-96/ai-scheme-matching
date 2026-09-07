import asyncio
import os
import sys
from fastapi.testclient import TestClient
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from app.database import check_database_connection

client = TestClient(app)

def test_root_endpoint():
    print("Testing GET / ...")
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "UdyamNex API"
    assert data["problem_statement_id"] == "26092"
    print("[PASS] Root endpoint verified:", data)

def test_health_endpoint():
    print("\nTesting GET /health and GET /api/v1/health ...")
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "UdyamNex API"
    assert "database_connected" in data
    print(f"[PASS] Health endpoint verified (Database Connected: {data['database_connected']}):", data)

def test_database_connection():
    print("\nTesting direct Supabase connection...")
    connected, msg = check_database_connection()
    print(f"[PASS] Supabase connection check: {connected} ({msg})")
    assert connected is True

if __name__ == "__main__":
    print("=" * 60)
    print("Running UdyamNex Foundation Backend Verification...")
    print("=" * 60)
    test_root_endpoint()
    test_health_endpoint()
    test_database_connection()
    print("\n" + "=" * 60)
    print("ALL BACKEND FOUNDATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
