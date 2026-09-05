import sys
import io

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
import json
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("      RUNNING ARTHSETU AI BACKEND TEST SUITE      ")
    print("==================================================")

    # 1. Test Health
    print("\n[1] Testing GET /health ...")
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json() == {"status": "ok"}
    print("  [PASS] /health passed:", res.json())

    # 2. Test Recommend
    print("\n[2] Testing POST /recommend ...")

    # 2a. Income > 500,000 (ineligible)
    res = client.post("/recommend", json={
        "project_type": "business",
        "project_cost": 100000,
        "annual_income": 600000,
        "city": "Bhopal"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["eligible"] is False
    assert "5,00,000" in data["reason"]
    print("  [PASS] Over-income check passed:", data["reason"])

    # 2b. Business <= 140,000 (Micro Credit Finance)
    res = client.post("/recommend", json={
        "project_type": "business",
        "project_cost": 120000,
        "annual_income": 200000,
        "city": "Bhopal"
    })
    assert res.status_code == 200
    micro_data = res.json()
    assert micro_data["eligible"] is True
    assert micro_data["matched_scheme"]["scheme_type"] == "micro_finance"
    assert micro_data["application_id"] is not None
    print("  [PASS] Micro Credit Finance match passed. App ID:", micro_data["application_id"])
    print("    Reasoning:", micro_data["reasoning"])

    # 2c. Business 140,001 - 50,00,000 (Term Loan)
    res = client.post("/recommend", json={
        "project_type": "business",
        "project_cost": 800000,
        "annual_income": 250000,
        "city": "Indore"
    })
    assert res.status_code == 200
    term_data = res.json()
    assert term_data["eligible"] is True
    assert term_data["matched_scheme"]["scheme_type"] == "term_loan"
    print("  [PASS] Term Loan Scheme match passed. Scheme ID:", term_data["matched_scheme"]["id"])

    # 2d. Education Loan
    res = client.post("/recommend", json={
        "project_type": "education",
        "project_cost": 1500000,
        "annual_income": 300000,
        "city": "Bhopal"
    })
    assert res.status_code == 200
    edu_data = res.json()
    assert edu_data["eligible"] is True
    assert edu_data["matched_scheme"]["scheme_type"] == "education_loan"
    print("  [PASS] Educational Loan Scheme match passed.")

    # 2e. Pydantic validation checks (negative cost, invalid type)
    res = client.post("/recommend", json={
        "project_type": "invalid_type",
        "project_cost": -100,
        "annual_income": 100000
    })
    assert res.status_code == 422
    print("  [PASS] Invalid payload rejected with 422.")

    # 3. Test EMI Calculate
    print("\n[3] Testing POST /emi-calculate ...")
    term_scheme_id = term_data["matched_scheme"]["id"]
    
    # 3a. Valid EMI calculation
    res = client.post("/emi-calculate", json={
        "scheme_id": term_scheme_id,
        "project_cost": 1000000,
        "annual_rate": 7.0,
        "tenure_months": 60
    })
    assert res.status_code == 200
    emi_data = res.json()
    assert emi_data["principal"] == 900000.0  # 90% of 10L
    assert emi_data["emi"] > 0
    assert emi_data["total_repayment"] > emi_data["principal"]
    assert emi_data["total_interest"] > 0
    print("  [PASS] EMI calculation valid:", json.dumps(emi_data, indent=4))

    # 3b. Rate out of range
    res = client.post("/emi-calculate", json={
        "scheme_id": term_scheme_id,
        "project_cost": 1000000,
        "annual_rate": 15.0,  # exceeds rate_max 8.0
        "tenure_months": 60
    })
    assert res.status_code == 422
    print("  [PASS] Out-of-bounds interest rate rejected with 422:", res.json()["detail"])

    # 3c. Tenure out of range
    res = client.post("/emi-calculate", json={
        "scheme_id": term_scheme_id,
        "project_cost": 1000000,
        "tenure_months": 240  # 20 years > 10 years max
    })
    assert res.status_code == 422
    print("  [PASS] Out-of-bounds tenure rejected with 422:", res.json()["detail"])

    # 4. Test Nearby Channel Partners
    print("\n[4] Testing GET /partners/nearby ...")

    # 4a. Lat/Long distance sorting
    res = client.get("/partners/nearby", params={
        "latitude": 23.2599,
        "longitude": 77.4126,
        "scheme_type": "micro_finance"
    })
    assert res.status_code == 200
    partners = res.json()
    assert len(partners) > 0
    assert "distance_km" in partners[0]
    assert partners[0]["distance_km"] == 0.0 or partners[0]["distance_km"] < 1.0
    print(f"  [PASS] Found {len(partners)} partners sorted by distance. Closest: {partners[0]['name']} ({partners[0]['distance_km']} km)")
    print("    Verified status:", partners[0]["is_real_verified"])

    # 4b. City fallback filter
    res = client.get("/partners/nearby", params={"city": "Indore"})
    assert res.status_code == 200
    indore_partners = res.json()
    assert any(p["city"] == "Indore" for p in indore_partners)
    print(f"  [PASS] Found {len(indore_partners)} partners matching city query 'Indore'")

    # 5. Test Application Guidance
    print("\n[5] Testing GET /guidance/{scheme_id} ...")
    res = client.get(f"/guidance/{term_scheme_id}")
    assert res.status_code == 200
    guidance = res.json()
    assert guidance["scheme_name"] == "Term Loan Scheme"
    assert len(guidance["required_documents"]) > 0
    assert len(guidance["application_steps"]) > 0
    print("  [PASS] Guidance fetched successfully:")
    print("    Scheme Name:", guidance["scheme_name"])
    print("    Required Docs Count:", len(guidance["required_documents"]))
    print("    Application Steps Count:", len(guidance["application_steps"]))
    print("    Where to Apply:", guidance["where_to_apply"])

    # 5b. Guidance 404
    res = client.get("/guidance/00000000-0000-0000-0000-000000000000")
    assert res.status_code == 404
    print("  [PASS] Non-existent scheme guidance returned 404.")

    # 6. Test PATCH /applications/{application_id}
    print("\n[6] Testing PATCH /applications/{application_id} ...")
    created_app_id = micro_data["application_id"]
    partner_id = partners[0]["id"]
    
    res = client.patch(f"/applications/{created_app_id}", json={
        "recommended_partner_id": partner_id
    })
    assert res.status_code == 200
    updated_app = res.json()
    assert updated_app["recommended_partner_id"] == partner_id
    print(f"  [PASS] Application {created_app_id} successfully updated with partner {partner_id}")

    print("\n==================================================")
    print("           ALL TESTS PASSED SUCCESSFULLY!          ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
