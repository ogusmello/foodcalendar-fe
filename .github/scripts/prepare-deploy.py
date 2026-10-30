import os, re
from pathlib import Path
def required(key):
    value = os.environ.get(key, "")
    if not value or "\n" in value or "\r" in value: raise ValueError("Missing or invalid " + key)
    return value
host = required("VPS_HOST")
user = required("VPS_USER")
port = required("VPS_PORT")
directory = required("VPS_DEPLOY_PATH")
app_port = required("APP_PORT")
api = required("API_BASE_URL")
image = required("APP_IMAGE")
if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9.-]*", host): raise ValueError("Invalid VPS_HOST")
if not re.fullmatch(r"[a-z_][a-z0-9_-]*", user): raise ValueError("Invalid VPS_USER")
if not re.fullmatch(r"/[a-zA-Z0-9_/-]+", directory) or ".." in directory or directory == "/": raise ValueError("Invalid VPS_DEPLOY_PATH")
if not all(v.isdigit() and 1 <= int(v) <= 65535 for v in [port, app_port]): raise ValueError("Invalid port")
from urllib.parse import urlsplit
url = urlsplit(api)
if url.scheme not in ["http", "https"] or not url.hostname or url.username or url.password or url.query or url.fragment: raise ValueError("Invalid API_BASE_URL")
if any(c in api for c in ["'", "$", "\\", " "]): raise ValueError("Unsupported characters in API_BASE_URL")
if not re.fullmatch(r"ghcr.io/[a-z0-9_./-]+@sha256:[a-f0-9]{64}", image): raise ValueError("Invalid image digest")
bundle = Path("deploy-bundle")
bundle.mkdir(mode=0o700, exist_ok=True)
# Single quotes prevent Compose interpolation of environment values.
(bundle / ".env").write_text(f"APP_IMAGE='{image}'\nAPI_BASE_URL='{api}'\nPORT='{app_port}'\n")
(bundle / ".env").chmod(0o600)
for env, filename in [("GHCR_READ_USER", ".registry-user"), ("GHCR_READ_TOKEN", ".registry-token")]:
    value = os.environ.get(env, "")
    (bundle / filename).write_text(value)
    (bundle / filename).chmod(0o600)
if bool(os.environ.get("GHCR_READ_USER")) != bool(os.environ.get("GHCR_READ_TOKEN")): raise ValueError("Set both GHCR read credentials or neither")
