#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
action="${1:?deploy or rollback}"
root="${2:?deployment directory}"
[[ "$root" =~ ^/[a-zA-Z0-9_/-]+$ && "$root" != / && "$root" != *..* ]] || { echo "Invalid deployment path"; exit 1; }
mkdir -p "$root"
export COMPOSE_PROJECT_NAME=yummy
unset APP_IMAGE API_BASE_URL PORT
compose() { docker compose --project-name yummy --env-file "$1/.env" -f "$1/compose.production.yaml" "${@:2}"; }
current="$(readlink -f "$root/current" 2>/dev/null || true)"
if [[ ! -f "$current/.env" ]]; then current=""; fi
registry=""
cleanup() {
  if [[ -n "$registry" ]]; then rm -rf -- "$registry"; fi
  if [[ "${validated_target:-false}" == true ]]; then
    rm -f -- "$target/.registry-token" "$target/.registry-user"
  fi
}
trap cleanup EXIT
if [[ "$action" == rollback ]]; then
  target="$(readlink -f "$root/previous" 2>/dev/null || true)"
  [[ -n "$target" && -f "$target/.env" ]] || { echo "No previous release available"; exit 1; }
elif [[ "$action" == deploy ]]; then
  target="${3:?release directory}"
  [[ "$target" == "$root"/releases/* && "$target" != *..* ]] || { echo "Invalid release path"; exit 1; }
  validated_target=true
  chmod 700 "$target"
  chmod 600 "$target/.env"
  if [[ -s "$target/.registry-token" ]]; then
    registry="$(mktemp -d "$root/.registry-XXXXXX")"
    export DOCKER_CONFIG="$registry"
    docker login ghcr.io --username "$(cat "$target/.registry-user")" --password-stdin < "$target/.registry-token" >/dev/null
  fi
else
  echo "Unsupported action"; exit 1
fi
exec 9>"$root/.deploy.lock"
flock -n 9 || { echo "Another deployment is running"; exit 1; }
compose "$target" config --quiet
if [[ -n "$current" ]]; then echo "Previous image: $(compose "$current" config --images)"; fi
# Pull failure leaves the running service unchanged.
if [[ "$action" == deploy ]]; then compose "$target" pull --quiet web; fi
frontend_ready() {
  compose "$1" exec -T web node -e '
    (async () => {
      const base = "http://127.0.0.1:3000";
      const health = await fetch(base + "/api/health", { signal: AbortSignal.timeout(15000) });
      if (!health.ok) throw new Error("Health check failed");
      const page = await fetch(base + "/", { signal: AbortSignal.timeout(15000) });
      if (!page.ok) throw new Error("Home check failed");
      const html = await page.text();
      const css = html.match(/href="([^"]+\.css[^"]*)"/)?.[1];
      if (!css) throw new Error("Missing stylesheet");
      const asset = await fetch(new URL(css, base), { signal: AbortSignal.timeout(15000) });
      if (!asset.ok) throw new Error("Static asset check failed");
    })().catch(() => process.exit(1));
  '
}
start_release() {
  compose "$1" up -d --no-build --pull never --wait --wait-timeout 90 &&
    frontend_ready "$1"
}
if ! start_release "$target"; then
  echo "Frontend deployment failed."
  if [[ -n "$current" ]]; then
    if start_release "$current"; then echo "Previous release restored."; else echo "Rollback failed; manual intervention required."; fi
  else
    compose "$target" down
    echo "First deployment failed; no previous release exists."
  fi
  exit 1
fi
if [[ -n "$current" && "$current" != "$target" ]]; then ln -sfn "$current" "$root/previous"; fi
ln -sfn "$target" "$root/current"
image="$(compose "$target" config --images)"
printf '%s %s %s\n' "$(date -u +%FT%TZ)" "$action" "$image" >> "$root/history.log"
echo "Frontend healthy: $image"
# Missing configuration intentionally selects demo mode.
if compose "$target" exec -T web node -e '
  fetch("http://127.0.0.1:3000/api/health")
    .then(r => r.json()).then(data => process.exit(data.mode === "mock" ? 0 : 1)).catch(() => process.exit(1));
'; then
  echo "Demo mode active: API_BASE_URL is not configured."
elif compose "$target" exec -T web node -e '
  fetch("http://127.0.0.1:3000/api/users", { signal: AbortSignal.timeout(15000) })
    .then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1));
'; then
  echo "Backend read check passed."
else
  echo "WARNING: frontend is healthy, but backend read check failed. Check API_BASE_URL and backend availability; no automatic rollback."
fi
