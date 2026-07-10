#!/usr/bin/env python3
"""Quick Turso DB helper for Shopify Spy data.
Usage:  python3 db.py "SELECT * FROM search_results LIMIT 5"
        python3 db.py --tables          # list tables
        python3 db.py --schema <table>  # show table schema
        python3 db.py --search <keyword> # search results for keyword
"""
import urllib.request, json, sys, os
from pathlib import Path
from urllib.parse import urlencode

# Monorepo root (backend/..) — shared .env with frontend
REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / ".env"


def _load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.is_file():
        return env
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def _pipeline_url(database_url: str) -> str:
    """libsql://host -> https://host/v2/pipeline"""
    host = database_url
    for prefix in ("libsql://", "https://", "http://"):
        if host.startswith(prefix):
            host = host[len(prefix) :]
            break
    host = host.rstrip("/")
    return f"https://{host}/v2/pipeline"


_env = _load_env(ENV_PATH)
# Prefer process env, fall back to monorepo-root .env
if "TURSO_DATABASE_URL" in _env and "TURSO_DATABASE_URL" not in os.environ:
    os.environ["TURSO_DATABASE_URL"] = _env["TURSO_DATABASE_URL"]
if "TURSO_AUTH_TOKEN" in _env and "TURSO_AUTH_TOKEN" not in os.environ:
    os.environ["TURSO_AUTH_TOKEN"] = _env["TURSO_AUTH_TOKEN"]


def get_token() -> str:
    token = os.environ.get("TURSO_AUTH_TOKEN") or _env.get("TURSO_AUTH_TOKEN")
    if not token:
        raise RuntimeError(f"TURSO_AUTH_TOKEN not found in {ENV_PATH}")
    return token


db_url = os.environ.get("TURSO_DATABASE_URL") or _env.get("TURSO_DATABASE_URL")
if not db_url:
    raise RuntimeError(f"TURSO_DATABASE_URL not found in {ENV_PATH}")
DB_URL = _pipeline_url(db_url)
token = get_token()

def run(sql, pretty=True):
    data = json.dumps({"requests": [{"type": "execute", "stmt": {"sql": sql}}]}).encode()
    req = urllib.request.Request(DB_URL, data=data, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })
    result = json.loads(urllib.request.urlopen(req).read())
    output = []
    for r in result["results"]:
        if "response" in r:
            cols = [c["name"] for c in r["response"]["result"]["cols"]]
            rows = r["response"]["result"]["rows"]
            for row in rows:
                vals = [cell.get("value", str(cell)) for cell in row]
                output.append(dict(zip(cols, vals)))
        elif "error" in r:
            output.append({"ERROR": r["error"]["message"]})
    return output

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "--tables":
        res = run("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        print("Tables:")
        for r in res:
            print(f"  {r['name']}")

    elif cmd == "--schema":
        if len(sys.argv) < 3:
            print("Usage: python3 db.py --schema <table_name>")
            sys.exit(1)
        res = run(f"SELECT sql FROM sqlite_master WHERE name='{sys.argv[2]}'")
        for r in res:
            print(r.get("sql", "Not found"))

    elif cmd == "--search":
        if len(sys.argv) < 3:
            print("Usage: python3 db.py --search <keyword>")
            sys.exit(1)
        keyword = sys.argv[2]
        res = run(f"SELECT * FROM search_results WHERE keyword LIKE '%{keyword}%' ORDER BY review_count DESC LIMIT 30")
        if not res:
            print(f"No results for '{keyword}'")
        else:
            print(f"{'App':<50} {'Rating':<8} {'Reviews':<8} {'Price':<12} {'Keyword'}")
            print("-"*100)
            for r in res:
                print(f"{r['title'][:48]:<50} {r.get('rating','?'):<8} {r.get('review_count','0'):<8} {r.get('price','?'):<12} {r.get('keyword','')}")

    elif cmd == "--favorites":
        res = run("SELECT * FROM favorites ORDER BY created_at DESC")
        print("Favorites:")
        for r in res:
            print(f"  app_id={r['app_id']}, saved={r['created_at']}")

    elif cmd == "--discover-status":
        import subprocess, sys
        subprocess.check_call([sys.executable, "discover.py", "status"])

    else:
        # Treat as raw SQL
        res = run(" ".join(sys.argv[1:]))
        for r in res:
            print(json.dumps(r, indent=2))
