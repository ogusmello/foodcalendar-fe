# Yummy!

A personal meal planner for couples, built with Next.js App Router, React, TypeScript, Tailwind CSS, and Framer Motion. All data is read from and written to the external Food Calendar API. The application has no demo mode, fixtures, or local data persistence.

## Setup

Requires Node.js 24 and pnpm 12.11.2.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
```

Configure the API URL in .env:

```dotenv
API_BASE_URL=https://api.example.com
PORT=3000
FOODIST_TAG=local
```

Use the base URL **without /v1**, a query string, or a fragment. The frontend adds /v1 to resource paths. Both HTTP and HTTPS are supported. Restart the server after changing environment settings. If .env.local exists, Next.js gives it priority: update or remove conflicting values in that file. Compose reads .env, not .env.local.

```sh
pnpm dev
```

Open http://localhost:3000. The browser calls the frontend's internal /api routes, and the Next.js server accesses the external API. API_BASE_URL is not a NEXT_PUBLIC variable and is not exposed to the browser. Missing configuration or an unavailable API produces an error; there is no fallback to sample data.

Add people in Settings, create meals, and schedule them in the calendar. IDs are provided by the API; no users or meals are predefined. Creating or copying plans for both people sends one request per person and reports partial success.

## API contract

The API uses JSON and exposes /v1/users, /v1/meals, and /v1/meal-plans. The backend lives in a separate repository. Dates are calendar dates (YYYY-MM-DD), without times. Meal types are BREAKFAST, LUNCH, SNACK, DINNER, and DESSERT. The current contract does not provide authentication, nutrients, or structured ingredients.

The integration follows the supplied backend README. Validation against a live backend still requires an available external environment.

## Docker Compose

Requires Docker Engine and Compose v2. Configure API_BASE_URL in .env before starting:

```sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs -f web
```

PORT sets the public port (default: 3000). Inside a container, localhost refers to that container: use the external API URL or a hostname reachable from the container's network.

The image uses Node 24, a multistage build, Next.js standalone output, and an unprivileged user. The API URL can be configured at runtime without rebuilding. There is no Nginx, database, or application data volume; persistence is the backend's responsibility. Old demo volumes are neither used nor automatically deleted.

The /api/health healthcheck verifies that the frontend responds, independently of backend availability. Backend failures are displayed in data views and forms.

Private .env files, .ai/, tests, and local dependencies are excluded from the build context. Fonts loaded through next/font may require internet access during the build.

### Updates

```sh
docker compose up -d --build
```

FOODIST_TAG identifies the image; this internal name is retained for compatibility. To return to an existing image, use FOODIST_TAG=v1 docker compose up -d --no-build. To stop the service, run docker compose down.

## Checks

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test
pnpm test:docker
```

pnpm test checks the external API transport, UI, and standalone runtime. Tests start an isolated HTTP server with contract responses, used only for testing. It is not part of the application and does not access your API or real data. These checks do not replace validation against a real backend.

For UI tests, install Chromium and its dependencies:

```sh
pnpm exec playwright install --with-deps chromium
```

pnpm test:docker builds an isolated image and checks health, the runtime user, static assets, and behavior without an available backend. It removes only the resources it creates.

## Project structure

Each component has its own folder containing index.tsx, types.tsx, and a parts/ directory for internal components. Tailwind styles and tokens live in app/globals.css. The data layer lives in lib/api, and the calendar lives in app/_components/features/CalendarView.

## Deployment with GitHub Actions

The **CI** workflow checks pull requests and pushes to main. After the tests pass, a push to main publishes an image to ghcr.io/ogusmello/foodcalendar-fe, tagged with the full commit SHA. Actions are pinned by SHA; only the publishing job receives registry write permission.

The **Deploy** workflow runs manually and accepts only commits on main with a successful CI and publication run. The image reference is resolved to a digest before deployment. On the VPS, compose.production.yaml pulls the built image without building or checking out the project.

### GitHub Secrets

Add these under Settings → Secrets and variables → Actions → Repository secrets:

| Secret | Value |
| --- | --- |
| VPS_HOST | VPS hostname or IPv4 address |
| VPS_PORT | SSH port, for example 22 |
| VPS_USER | SSH user with access to Docker and the deployment directory |
| VPS_DEPLOY_PATH | Absolute path, for example /opt/yummy; no spaces or .. |
| VPS_ARCH | amd64 or arm64; used by the publishing job |
| APP_PORT | Public frontend port, for example 3000 |
| API_BASE_URL | Backend HTTP/HTTPS URL reachable from the container, without /v1 |
| VPS_SSH_PRIVATE_KEY | Deployment user's private SSH key |
| VPS_KNOWN_HOSTS | VPS known_hosts entry, with its fingerprint verified through a trusted channel |
| GHCR_READ_USER | Username for reading private GHCR images |
| GHCR_READ_TOKEN | Token with read access to the private package |

Both GHCR_READ_* Secrets may be omitted only when the image is public. GitHub automatically provides the workflow's GITHUB_TOKEN to publish and inspect images; you do not need to create it.

Use **repository** Secrets, including VPS_ARCH, because publishing does not use the production environment. Deployment uses the production environment, where you can configure additional protections. Never commit credentials.

API_BASE_URL must be a simple URL without embedded credentials, a query string, or a fragment. All connection and environment settings are configured through Secrets. The workflow generates the VPS .env with restricted permissions and transfers it over SSH; the file is neither committed nor included in the image. Changes to Secrets take effect on the next deployment.

For an SSH port other than 22, known_hosts must identify [host]:port. Do not disable SSH host key verification.

### One-time VPS preparation

Install Docker Engine, Compose v2, Bash, tar, and flock (util-linux). Provide enough disk space for at least the current and previous images. The deployment user must be able to run Docker without interaction and create or write files in the selected directory. Prepare that directory before the first deployment, granting the user the required permissions.

The VPS must be able to access GHCR and the external backend. The container must be able to reach API_BASE_URL. The workflow does not install Docker, create users, or change the firewall. Nginx is not included at this stage; public access, domain configuration, and HTTPS depend on your infrastructure.

### First deployment and updates

1. Configure the Secrets and prepare the VPS.
2. Push the workflows to main and wait for CI, including image publication, to complete successfully.
3. Under Actions → Deploy → Run workflow, select the main branch, set action=deploy, and enter the full SHA of the approved commit.
4. Review the result and any warnings in the workflow summary.

Deployment downloads the image before changing the service and waits for the frontend to become healthy. If startup or HTTP verification fails, it attempts to restore the previous image and .env. On the first deployment, there is no previous release; a failure stops the new service and requires correction.

Backend connectivity is checked separately. An unavailable backend produces an explicit warning and does not trigger automatic frontend rollback. Validation does not create or delete production data.

Deployment replaces a single instance and may cause a brief interruption. Zero downtime is not guaranteed.

### Rollback and operations

Run Actions → Deploy → Run workflow with action=rollback; the commit field is ignored. This uses the previous release recorded on the VPS, including its .env, and requires that its image is still in the Docker cache. It does not change backend data.

Deployment directory structure:

- releases/<run-id>-<attempt>: Compose configuration, deployment script, and .env for each release.
- current and previous: references to the current and previous releases.
- history.log: record of versions and operations.
- .deploy.lock: lock preventing concurrent deployments.

To inspect the service directly on the VPS, enter <deployment-directory>/current and run:

```sh
docker compose --project-name yummy --env-file .env -f compose.production.yaml ps
docker compose --project-name yummy --env-file .env -f compose.production.yaml logs --tail 100 web
```

Avoid broad prune operations: keep the current and previous images on the host and their SHA tags in GHCR. The pipeline does not delete registry images; the initial retention policy has no automatic cleanup. Releases contain private configuration: retain restricted permissions and secure backups. Rotate compromised credentials and update the Secrets.

### Local deployment checks

```sh
pnpm test:deploy
pnpm test:docker
```

The first command tests orchestration with an isolated substitute for the Docker command: download failures, startup failures, automatic recovery, manual rollback, backend warnings, and environment validation. The second builds the image and runs the production Compose configuration with Docker. These tests do not replace the first GitHub/VPS run, which requires your environment's Secrets and access.
