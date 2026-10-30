"""Exercise deployment orchestration with an isolated Docker command substitute."""
import json, os, shutil, subprocess, tempfile
from pathlib import Path
repository = Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix="yummy-deploy-") as directory:
    directory = Path(directory)
    binary = directory / "bin"
    binary.mkdir()
    docker = binary / "docker"
    docker.write_text(r"""#!/usr/bin/env python3
import json, os, sys
from pathlib import Path
a = sys.argv[1:]
with open(os.environ["TEST_LOG"], "a") as f: f.write(json.dumps(a) + "\n")
if "login" in a: sys.stdin.read(); sys.exit(0)
config = a[a.index("-f")+1] if "-f" in a else ""
if "pull" in a and os.environ.get("FAIL_PULL") == "1": sys.exit(1)
if "up" in a and os.environ.get("FAIL_UP") and os.environ["FAIL_UP"] in config: sys.exit(1)
if "config" in a and "--images" in a: print("ghcr.io/test/app@sha256:" + "a"*64)
if "exec" in a and "data.mode" in a[-1]: sys.exit(0 if os.environ.get("TEST_DEMO_MODE") == "1" else 1)
if "exec" in a and "/api/users" in a[-1] and os.environ.get("FAIL_BACKEND") == "1": sys.exit(1)
""")
    docker.chmod(0o700)
    root = directory / "host"
    root.mkdir()
    env = {**os.environ, "PATH": str(binary) + ":" + os.environ["PATH"], "TEST_LOG": str(directory / "calls")}
    def release(name):
        target = root / "releases" / name
        target.mkdir(parents=True)
        (target / ".env").write_text("API_BASE_URL=https://example.com" + chr(10) + "APP_IMAGE=ghcr.io/test/app@sha256:" + "a"*64 + chr(10))
        shutil.copy(repository / "compose.production.yaml", target)
        return target
    def run(action, target=None, **extra):
        command = ["bash", str(repository / "scripts/deploy.sh"), action, str(root)]
        if target: command.append(str(target))
        return subprocess.run(command, env={**env, **extra}, text=True, capture_output=True)
    first = release("first")
    result = run("deploy", first)
    assert result.returncode == 0, result.stderr
    assert (root / "current").resolve() == first
    second = release("second")
    (second / ".registry-user").write_text("test-user")
    (second / ".registry-token").write_text("test-token")
    result = run("deploy", second, FAIL_PULL="1")
    assert result.returncode != 0
    assert not (second / ".registry-token").exists()
    assert (root / "current").resolve() == first
    result = run("deploy", second, FAIL_UP="/second/")
    assert result.returncode != 0
    assert "Previous release restored" in result.stdout
    assert (root / "current").resolve() == first
    result = run("deploy", second, FAIL_BACKEND="1")
    assert result.returncode == 0
    assert "WARNING:" in result.stdout
    assert (root / "current").resolve() == second
    assert (root / "previous").resolve() == first
    result = run("rollback")
    assert result.returncode == 0
    assert (root / "current").resolve() == first
    result = run("deploy", first, TEST_DEMO_MODE="1")
    assert result.returncode == 0, result.stderr
    assert "Demo mode active:" in result.stdout
    assert "Backend read check" not in result.stdout
    # Configuration rendering and validation must not reveal values in logs.
    config_env = {**os.environ, "VPS_HOST":"vps.example.com", "VPS_USER":"deploy", "VPS_PORT":"22",
                  "VPS_DEPLOY_PATH":"/opt/yummy", "APP_PORT":"3000", "API_BASE_URL":"https://api.example.com",
                  "APP_IMAGE":"ghcr.io/test/app@sha256:"+"a"*64}
    prepare = repository / ".github/scripts/prepare-deploy.py"
    result = subprocess.run(["python3",str(prepare)], cwd=directory, env=config_env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert "API_BASE_URL='https://api.example.com'" in (directory / "deploy-bundle/.env").read_text()
    result = subprocess.run(["python3",str(prepare)], cwd=directory, env={**config_env,"API_BASE_URL":""},capture_output=True)
    assert result.returncode == 0
    result = subprocess.run(["python3",str(prepare)], cwd=directory, env={**config_env,"VPS_DEPLOY_PATH":"/opt/../etc"},capture_output=True)
    assert result.returncode != 0
print("PASS: deployment, download failure, automatic rollback, manual rollback, backend warning and Secrets validation.")
