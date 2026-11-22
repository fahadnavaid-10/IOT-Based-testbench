"""Quick API smoke tests. Run with: python test_api.py (backend must be running on port 5000)."""
import urllib.request
import urllib.error
import json
import sys

BASE = "http://127.0.0.1:5000/api"

def req(path, method="GET", data=None, token=None):
    url = BASE + path
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode()
            if not body:
                return None
            try:
                return json.loads(body)
            except json.JSONDecodeError:
                print(" [raw body:", repr(body[:200]), "]")
                raise
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        try:
            err = json.loads(body) if body else {}
            raise RuntimeError("HTTP %s: %s" % (e.code, err.get("msg", err) or body[:200]))
        except (ValueError, json.JSONDecodeError):
            raise RuntimeError("HTTP %s: %s" % (e.code, body[:200] or str(e)))

def main():
    errors = []
    # 1. Health
    try:
        out = req("/health")
        if out is None:
            raise ValueError("Empty response")
        if not isinstance(out, dict):
            raise ValueError("Expected dict, got %s" % type(out))
        if out.get("status") != "ok":
            raise ValueError("status != ok: %s" % out)
        print("OK GET /api/health")
    except Exception as e:
        errors.append(f"health: {e}")
        print("FAIL GET /api/health:", e)
        return 1

    # 2. Login
    try:
        out = req("/login", method="POST", data={"email": "admin@iot.dev", "password": "password"})
        assert "token" in out and "user" in out
        token = out["token"]
        print("OK POST /api/login")
    except Exception as e:
        errors.append(f"login: {e}")
        print("FAIL POST /api/login:", e)
        return 1

    # 3. Me
    try:
        out = req("/me", token=token)
        assert out.get("email") == "admin@iot.dev"
        print("OK GET /api/me")
    except Exception as e:
        errors.append(f"me: {e}")
        print("FAIL GET /api/me:", e)

    # 4. Nodes
    try:
        out = req("/nodes", token=token)
        assert isinstance(out, list)
        print("OK GET /api/nodes (count=%d)" % len(out))
    except Exception as e:
        errors.append(f"nodes: {e}")
        print("FAIL GET /api/nodes:", e)

    # 5. Experiments
    try:
        out = req("/experiments", token=token)
        assert isinstance(out, list)
        print("OK GET /api/experiments (count=%d)" % len(out))
    except Exception as e:
        errors.append(f"experiments: {e}")
        print("FAIL GET /api/experiments:", e)

    # 6. Deploy list
    try:
        out = req("/deploy", token=token)
        assert isinstance(out, list)
        print("OK GET /api/deploy (count=%d)" % len(out))
    except Exception as e:
        errors.append(f"deploy list: {e}")
        print("FAIL GET /api/deploy:", e)

    # 7. Admin stats
    try:
        out = req("/admin/stats", token=token)
        assert "totalNodes" in out or "onlineNodes" in out
        print("OK GET /api/admin/stats")
    except Exception as e:
        errors.append(f"admin/stats: {e}")
        print("FAIL GET /api/admin/stats:", e)

    if errors:
        print("\nErrors:", errors)
        return 1
    print("\nAll API checks passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
