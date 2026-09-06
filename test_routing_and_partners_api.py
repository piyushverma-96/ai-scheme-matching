import asyncio
import httpx

async def test_backend_routing_and_partners():
    print("--- 1. Testing Backend Live Routing Endpoint (/api/v1/partners/route) ---")
    
    # Bhopal: Applicant at (23.2350, 77.4000) -> SBI TT Nagar at (23.2356, 77.4012)
    async with httpx.AsyncClient(timeout=10.0) as client:
        bhopal_req = {
            "start_lat": 23.2350,
            "start_lng": 77.4000,
            "end_lat": 23.2356,
            "end_lng": 77.4012,
        }
        res = await client.post("http://127.0.0.1:8000/api/v1/partners/route", json=bhopal_req)
        assert res.status_code == 200, f"Bhopal route failed: {res.status_code} {res.text}"
        data = res.json()
        print(f"Bhopal Route Result:")
        print(f"  Distance: {data['distance_km']} km")
        print(f"  Duration: {data['duration_mins']} mins")
        print(f"  Waypoints: {len(data['route_points'])}")
        print(f"  Live Routing: {data['is_live_routing']}")
        assert data['is_live_routing'] is True
        assert len(data['route_points']) > 2, "Expected curved road polyline with > 2 waypoints!"
        print("  [PASS] Bhopal Road Route Verified (Real road geometry)")

        # Indore: Applicant at (22.7196, 75.8577) -> Bank of India MG Road (22.7180, 75.8590)
        indore_req = {
            "start_lat": 22.7196,
            "start_lng": 75.8577,
            "end_lat": 22.7180,
            "end_lng": 75.8590,
        }
        res_indore = await client.post("http://127.0.0.1:8000/api/v1/partners/route", json=indore_req)
        assert res_indore.status_code == 200
        data_indore = res_indore.json()
        print(f"\nIndore Route Result:")
        print(f"  Distance: {data_indore['distance_km']} km")
        print(f"  Duration: {data_indore['duration_mins']} mins")
        print(f"  Waypoints: {len(data_indore['route_points'])}")
        print(f"  Live Routing: {data_indore['is_live_routing']}")
        assert data_indore['is_live_routing'] is True
        assert len(data_indore['route_points']) > 2
        print("  [PASS] Indore Road Route Verified (Real road geometry)")

        # Jabalpur: Applicant at (23.1815, 79.9864) -> Central Bank Civil Lines (23.1686, 79.9539)
        jabalpur_req = {
            "start_lat": 23.1815,
            "start_lng": 79.9864,
            "end_lat": 23.1686,
            "end_lng": 79.9539,
        }
        res_jabalpur = await client.post("http://127.0.0.1:8000/api/v1/partners/route", json=jabalpur_req)
        assert res_jabalpur.status_code == 200
        data_jabalpur = res_jabalpur.json()
        print(f"\nJabalpur Route Result:")
        print(f"  Distance: {data_jabalpur['distance_km']} km")
        print(f"  Duration: {data_jabalpur['duration_mins']} mins")
        print(f"  Waypoints: {len(data_jabalpur['route_points'])}")
        print(f"  Live Routing: {data_jabalpur['is_live_routing']}")
        assert data_jabalpur['is_live_routing'] is True
        assert len(data_jabalpur['route_points']) > 10
        print("  [PASS] Jabalpur Road Route Verified (Real road geometry)")

    print("\n--- 2. Testing Partner Ranking by Location (/api/v1/partners/nearby) ---")
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Search Bhopal
        bhopal_partners = await client.get("http://127.0.0.1:8000/api/v1/partners/nearby?latitude=23.2350&longitude=77.4000&city=Bhopal")
        assert bhopal_partners.status_code == 200
        bp_data = bhopal_partners.json()
        rec_bhopal = bp_data["eligible_partners"][0]["partner"]
        print(f"Bhopal Top Partner: {rec_bhopal['name']} in {rec_bhopal['city']} ({bp_data['eligible_partners'][0]['distance_km']} km)")
        assert rec_bhopal["city"] == "Bhopal"
        print("  [PASS] Bhopal ranking verified")

        # Search Indore
        indore_partners = await client.get("http://127.0.0.1:8000/api/v1/partners/nearby?latitude=22.7196&longitude=75.8577&city=Indore")
        assert indore_partners.status_code == 200
        ip_data = indore_partners.json()
        rec_indore = ip_data["eligible_partners"][0]["partner"]
        print(f"Indore Top Partner: {rec_indore['name']} in {rec_indore['city']} ({ip_data['eligible_partners'][0]['distance_km']} km)")
        assert rec_indore["city"] == "Indore"
        print("  [PASS] Indore ranking verified")

        # Search Jabalpur
        jabalpur_partners = await client.get("http://127.0.0.1:8000/api/v1/partners/nearby?latitude=23.1815&longitude=79.9864&city=Jabalpur")
        assert jabalpur_partners.status_code == 200
        jp_data = jabalpur_partners.json()
        rec_jabalpur = jp_data["eligible_partners"][0]["partner"]
        print(f"Jabalpur Top Partner: {rec_jabalpur['name']} in {rec_jabalpur['city']} ({jp_data['eligible_partners'][0]['distance_km']} km)")
        assert rec_jabalpur["city"] == "Jabalpur"
        print("  [PASS] Jabalpur ranking verified")

    print("\n==========================================")
    print("ALL API ROUTING & RANKING TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(test_backend_routing_and_partners())
