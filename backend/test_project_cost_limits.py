"""
Test script verifying per-scheme project cost max limits and filtering behavior.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.services.eligibility import check_all_schemes


def test_per_scheme_project_cost_max_limits():
    client = TestClient(app)
    
    # Test 1: project_cost = 100,000 (fits MFS, AMY, UNY)
    resp = client.post(
        "/schemes/match",
        json={
            "purpose": "micro_business",
            "annual_family_income": 250000,
            "project_cost": 100000,
            "loan_amount": 90000,
            "sc_caste_declared": True,
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    scheme_map = {r["scheme_name"]: r for r in data["results"]}
    
    assert "Micro Finance Scheme (MFS)" in scheme_map
    assert scheme_map["Micro Finance Scheme (MFS)"]["project_cost_max"] == 140000.0
    assert scheme_map["Micro Finance Scheme (MFS)"]["project_cost_max_display"] == "Up to ₹1.40 Lakh"
    
    assert "Aajeevika Micro-Finance Yojana (AMY)" in scheme_map
    assert scheme_map["Aajeevika Micro-Finance Yojana (AMY)"]["project_cost_max"] == 140000.0
    assert scheme_map["Aajeevika Micro-Finance Yojana (AMY)"]["project_cost_max_display"] == "Up to ₹1.40 Lakh"
    
    if "Udyam Nidhi Yojana (UNY)" in scheme_map:
        assert scheme_map["Udyam Nidhi Yojana (UNY)"]["project_cost_max"] == 500000.0
        assert scheme_map["Udyam Nidhi Yojana (UNY)"]["project_cost_max_display"] == "Up to ₹5.00 Lakh"


def test_submit_project_cost_200k_excludes_mfs_and_amy():
    client = TestClient(app)
    
    # Test 2: project_cost = 200,000 (exceeds MFS/AMY 1.4L cap, fits Term Loan and UNY)
    resp = client.post(
        "/schemes/match",
        json={
            "purpose": "business",
            "annual_family_income": 250000,
            "project_cost": 200000,
            "loan_amount": 180000,
            "sc_caste_declared": True,
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    matched_names = [r["scheme_name"] for r in data["results"]]
    
    # Confirm ONLY Term Loan and UNY appear
    assert "Term Loan" in matched_names
    term_loan = next(r for r in data["results"] if r["scheme_name"] == "Term Loan")
    assert term_loan["project_cost_max"] == 5000000.0
    assert term_loan["project_cost_max_display"] == "Up to ₹50.00 Lakh"
    
    # Confirm MFS and AMY do NOT appear because 200,000 exceeds their 1.4L cap
    assert "Micro Finance Scheme (MFS)" not in matched_names
    assert "Aajeevika Micro-Finance Yojana (AMY)" not in matched_names


def test_rule_engine_detailed_rejection_for_200k():
    results = check_all_schemes(
        purpose="business",
        annual_family_income=250000,
        project_cost=200000,
        loan_amount=180000,
        sc_caste_declared=True,
    )
    res_by_name = {r.scheme_name: r for r in results}
    
    # Term Loan: eligible
    assert res_by_name["Term Loan"].eligible is True
    assert res_by_name["Term Loan"].project_cost_max == 5000000.0
    assert res_by_name["Term Loan"].project_cost_max_display == "Up to ₹50.00 Lakh"
    
    # UNY: eligible
    assert res_by_name["Udyam Nidhi Yojana (UNY)"].eligible is True
    assert res_by_name["Udyam Nidhi Yojana (UNY)"].project_cost_max == 500000.0
    assert res_by_name["Udyam Nidhi Yojana (UNY)"].project_cost_max_display == "Up to ₹5.00 Lakh"
    
    # MFS: ineligible due to project_cost > 140,000
    assert res_by_name["Micro Finance Scheme (MFS)"].eligible is False
    assert res_by_name["Micro Finance Scheme (MFS)"].project_cost_max == 140000.0
    assert res_by_name["Micro Finance Scheme (MFS)"].project_cost_max_display == "Up to ₹1.40 Lakh"
    assert any("Project cost exceeds the maximum allowable limit of ₹140,000" in f for f in res_by_name["Micro Finance Scheme (MFS)"].failed_factors)
    
    # AMY: ineligible due to project_cost > 140,000
    assert res_by_name["Aajeevika Micro-Finance Yojana (AMY)"].eligible is False
    assert res_by_name["Aajeevika Micro-Finance Yojana (AMY)"].project_cost_max == 140000.0
    assert res_by_name["Aajeevika Micro-Finance Yojana (AMY)"].project_cost_max_display == "Up to ₹1.40 Lakh"
    assert any("Project cost exceeds the maximum allowable limit of ₹140,000" in f for f in res_by_name["Aajeevika Micro-Finance Yojana (AMY)"].failed_factors)


if __name__ == "__main__":
    test_per_scheme_project_cost_max_limits()
    test_submit_project_cost_200k_excludes_mfs_and_amy()
    test_rule_engine_detailed_rejection_for_200k()
    print("ALL TESTS PASSED SUCCESSFULLY!")
