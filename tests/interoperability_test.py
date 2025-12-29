"""
Eigensparse - Interoperability Test Suite
Tests API interoperability across multiple simulated applications

Run with: python interoperability_test.py
Requires: Backend running on localhost:8000
"""

import requests
import time
import sys

BASE_URL = "http://localhost:8000/api"


class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []

    def add(self, name, passed, details=""):
        self.tests.append({"name": name, "passed": passed, "details": details})
        if passed:
            self.passed += 1
            print(f"  [PASS] {name}")
        else:
            self.failed += 1
            print(f"  [FAIL] {name} - {details}")

    def summary(self):
        print("\n" + "=" * 50)
        print(f"Test Results: {self.passed} passed, {self.failed} failed")
        print("=" * 50)
        return self.failed == 0


def test_health_check(results):
    """Test API health endpoint"""
    try:
        r = requests.get(f"{BASE_URL}/health")
        results.add("Health Check", r.status_code == 200 and r.json()["status"] == "healthy")
    except Exception as e:
        results.add("Health Check", False, str(e))


def test_user_registration(results):
    """Test user registration flow"""
    try:
        user_data = {
            "name": "Test User",
            "email": f"test_{int(time.time())}@example.com",
            "password": "SecurePass123"
        }
        r = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        results.add("User Registration", r.status_code == 200)
        return user_data, r.json() if r.status_code == 200 else None
    except Exception as e:
        results.add("User Registration", False, str(e))
        return None, None


def test_user_login(results, email, password):
    """Test user login flow"""
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        results.add("User Login", r.status_code == 200 and "access_token" in r.json())
        return r.json().get("access_token") if r.status_code == 200 else None
    except Exception as e:
        results.add("User Login", False, str(e))
        return None


def test_fiduciary_registration(results):
    """Test data fiduciary registration"""
    try:
        fiduciary_data = {
            "name": f"Test App {int(time.time())}",
            "description": "Test application for interoperability testing",
            "contact_email": f"fiduciary_{int(time.time())}@testapp.com",
            "password": "SecurePass123"
        }
        r = requests.post(f"{BASE_URL}/auth/fiduciary/register", json=fiduciary_data)
        success = r.status_code == 200 and "access_token" in r.json()
        results.add("Fiduciary Registration", success)

        if success:
            return r.json()
        return None
    except Exception as e:
        results.add("Fiduciary Registration", False, str(e))
        return None


def test_get_fiduciary_profile(results, token):
    """Get fiduciary profile with API key"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/auth/fiduciary/me", headers=headers)
        success = r.status_code == 200 and "api_key" in r.json()
        results.add("Get Fiduciary Profile", success)
        return r.json() if success else None
    except Exception as e:
        results.add("Get Fiduciary Profile", False, str(e))
        return None


def test_purpose_creation(results, api_key):
    """Test purpose creation with API key"""
    try:
        purpose_data = {
            "name": "Test Purpose",
            "description": "Purpose for testing interoperability",
            "data_categories": ["Name", "Email"],
            "retention_period_days": 365,
            "legal_basis": "consent",
            "is_mandatory": False
        }
        headers = {"X-API-Key": api_key}
        r = requests.post(f"{BASE_URL}/purposes", json=purpose_data, headers=headers)
        results.add("Purpose Creation", r.status_code == 200)
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        results.add("Purpose Creation", False, str(e))
        return None


def test_consent_grant(results, token, purpose_id, fiduciary_uuid):
    """Test consent granting"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        consent_data = {
            "purpose_id": purpose_id,
            "fiduciary_uuid": fiduciary_uuid
        }
        r = requests.post(f"{BASE_URL}/consents/grant", json=consent_data, headers=headers)
        success = r.status_code == 200 and "receipt_id" in r.json()
        results.add("Consent Grant", success)
        return r.json() if success else None
    except Exception as e:
        results.add("Consent Grant", False, str(e))
        return None


def test_consent_receipt(results, token, consent_uuid):
    """Test consent receipt retrieval"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/consents/{consent_uuid}/receipt", headers=headers)
        success = r.status_code == 200 and "signature" in r.json()
        results.add("Consent Receipt", success)
        return r.json() if success else None
    except Exception as e:
        results.add("Consent Receipt", False, str(e))
        return None


def test_sdk_consent_check(results, api_key, user_email):
    """Test SDK consent check endpoint"""
    try:
        headers = {"X-API-Key": api_key}
        data = {"user_email": user_email}
        r = requests.post(f"{BASE_URL}/sdk/check-consent", json=data, headers=headers)
        success = r.status_code == 200 and "has_consent" in r.json()
        results.add("SDK Consent Check", success)
        return r.json() if success else None
    except Exception as e:
        results.add("SDK Consent Check", False, str(e))
        return None


def test_sdk_get_purposes(results, api_key):
    """Test SDK get purposes endpoint"""
    try:
        headers = {"X-API-Key": api_key}
        r = requests.get(f"{BASE_URL}/sdk/purposes", headers=headers)
        success = r.status_code == 200 and isinstance(r.json(), list)
        results.add("SDK Get Purposes", success)
        return r.json() if success else None
    except Exception as e:
        results.add("SDK Get Purposes", False, str(e))
        return None


def test_consent_revocation(results, token, consent_uuid):
    """Test consent revocation"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {"consent_uuid": consent_uuid, "reason": "Testing revocation"}
        r = requests.post(f"{BASE_URL}/consents/revoke", json=data, headers=headers)
        results.add("Consent Revocation", r.status_code == 200)
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        results.add("Consent Revocation", False, str(e))
        return None


def test_audit_logs(results, token):
    """Test audit log retrieval"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/audit-logs", headers=headers)
        success = r.status_code == 200 and isinstance(r.json(), list)
        results.add("Audit Logs Retrieval", success)
        return r.json() if success else None
    except Exception as e:
        results.add("Audit Logs Retrieval", False, str(e))
        return None


def test_cross_app_consent_isolation(results, api_key1, api_key2, user_email):
    """Test that consent granted to App1 is NOT visible to App2"""
    try:
        # Check with first app's API key (should see consent)
        headers1 = {"X-API-Key": api_key1}
        r1 = requests.post(
            f"{BASE_URL}/sdk/check-consent",
            json={"user_email": user_email},
            headers=headers1
        )

        # Check with second app's API key (should NOT see consent)
        headers2 = {"X-API-Key": api_key2}
        r2 = requests.post(
            f"{BASE_URL}/sdk/check-consent",
            json={"user_email": user_email},
            headers=headers2
        )

        app1_has_consent = r1.status_code == 200 and r1.json().get("has_consent", False)
        app2_no_consent = r2.status_code == 200 and not r2.json().get("has_consent", True)

        # App1 should see consent, App2 should NOT see consent
        results.add(
            "Cross-App Consent Isolation",
            app1_has_consent and app2_no_consent,
            f"App1 sees: {app1_has_consent}, App2 sees: {not app2_no_consent}"
        )
    except Exception as e:
        results.add("Cross-App Consent Isolation", False, str(e))


def measure_latency(endpoint, method="GET", **kwargs):
    """Measure API response latency"""
    start = time.time()
    if method == "GET":
        requests.get(f"{BASE_URL}{endpoint}", **kwargs)
    else:
        requests.post(f"{BASE_URL}{endpoint}", **kwargs)
    return (time.time() - start) * 1000  # Convert to ms


def test_performance_kpis(results, token, api_key, user_email):
    """Test performance KPIs"""
    headers_auth = {"Authorization": f"Bearer {token}"}
    headers_api = {"X-API-Key": api_key}

    # Measure consent check latency
    latencies = []
    for _ in range(5):
        latency = measure_latency(
            "/sdk/check-consent",
            "POST",
            headers=headers_api,
            json={"user_email": user_email}
        )
        latencies.append(latency)

    avg_latency = sum(latencies) / len(latencies)
    results.add(
        f"Consent Check Latency (<100ms)",
        avg_latency < 100,
        f"Avg: {avg_latency:.2f}ms"
    )

    # Measure audit log retrieval
    latency = measure_latency("/audit-logs?limit=100", headers=headers_auth)
    results.add(
        f"Audit Log Retrieval (<500ms)",
        latency < 500,
        f"Latency: {latency:.2f}ms"
    )


def run_tests():
    """Run all interoperability tests"""
    print("=" * 50)
    print("Eigensparse Interoperability Test Suite")
    print("=" * 50)

    results = TestResults()

    # Phase 1: Health Check
    print("\n[Phase 1: Basic API Tests]")
    test_health_check(results)

    # Phase 2: User Registration & Login
    print("\n[Phase 2: User Flow Tests]")
    user_creds, user = test_user_registration(results)
    if not user_creds:
        print("Cannot continue without user registration")
        return results.summary()

    token = test_user_login(results, user_creds["email"], user_creds["password"])
    if not token:
        print("Cannot continue without login token")
        return results.summary()

    # Phase 3: Fiduciary Registration
    print("\n[Phase 3: Fiduciary Registration Tests]")
    fiduciary1_auth = test_fiduciary_registration(results)
    fiduciary2_auth = test_fiduciary_registration(results)

    if not fiduciary1_auth:
        print("Cannot continue without fiduciary")
        return results.summary()

    # Get fiduciary profiles (with API keys)
    fiduciary1 = test_get_fiduciary_profile(results, fiduciary1_auth["access_token"])
    fiduciary2 = test_get_fiduciary_profile(results, fiduciary2_auth["access_token"]) if fiduciary2_auth else None

    if not fiduciary1:
        print("Cannot continue without fiduciary profile")
        return results.summary()

    # Phase 4: Purpose Creation
    print("\n[Phase 4: Purpose Management Tests]")
    purpose = test_purpose_creation(results, fiduciary1["api_key"])
    test_sdk_get_purposes(results, fiduciary1["api_key"])

    # Phase 5: Consent Grant
    print("\n[Phase 5: Consent Management Tests]")
    consent = None
    if purpose:
        consent = test_consent_grant(
            results, token, purpose["id"], fiduciary1["uuid"]
        )

        if consent:
            test_consent_receipt(results, token, consent["consent_uuid"])
            test_sdk_consent_check(results, fiduciary1["api_key"], user_creds["email"])

    # Phase 6: Revocation
    print("\n[Phase 6: Revocation Tests]")
    if consent:
        # First verify consent exists via SDK
        sdk_result = test_sdk_consent_check(results, fiduciary1["api_key"], user_creds["email"])

        # Revoke consent
        test_consent_revocation(results, token, consent["consent_uuid"])

        # Verify consent no longer active via SDK
        headers = {"X-API-Key": fiduciary1["api_key"]}
        r = requests.post(
            f"{BASE_URL}/sdk/check-consent",
            json={"user_email": user_creds["email"]},
            headers=headers
        )
        post_revoke = r.json() if r.status_code == 200 else None
        results.add(
            "Post-Revocation Consent Check",
            post_revoke and not post_revoke.get("has_consent", True),
            f"has_consent: {post_revoke.get('has_consent') if post_revoke else 'N/A'}"
        )

    # Phase 7: Audit Logs
    print("\n[Phase 7: Audit & Compliance Tests]")
    test_audit_logs(results, token)

    # Phase 8: Cross-App Isolation (need to re-grant consent for this test)
    print("\n[Phase 8: Cross-App Isolation Tests]")
    if fiduciary1 and fiduciary2 and purpose:
        # Re-grant consent for isolation test
        headers = {"Authorization": f"Bearer {token}"}
        consent_data = {"purpose_id": purpose["id"], "fiduciary_uuid": fiduciary1["uuid"]}
        r = requests.post(f"{BASE_URL}/consents/grant", json=consent_data, headers=headers)

        if r.status_code == 200:
            test_cross_app_consent_isolation(
                results,
                fiduciary1["api_key"],
                fiduciary2["api_key"],
                user_creds["email"]
            )
        else:
            results.add("Cross-App Consent Isolation", False, "Could not re-grant consent")

    # Phase 9: Performance KPIs
    print("\n[Phase 9: Performance KPIs]")
    test_performance_kpis(results, token, fiduciary1["api_key"], user_creds["email"])

    return results.summary()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
