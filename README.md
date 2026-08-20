# BlackBox

**BlackBox** is a mobile-first workspace for organizing authorized technical-analysis work. It gives operators a single place to prepare analysis handoffs, track findings, review the health of a private analysis stack, and approve limited dispatches through a secured operator gateway.

> BlackBox coordinates approved workflows; it does not place private-stack credentials in the mobile client or fabricate remote analysis results.

## What the app includes

| Area | Capabilities |
|---|---|
| Workspace management | Create and organize local workspaces, analysis records, workflow states, and verified findings. |
| Analysis preparation | Select approved modules, record scope and acknowledgements, and prepare an analysis handoff. |
| Stack awareness | View the configured analysis modules: MobSF, Ghidra, Frida, Filesystem, Git, and SQLite. |
| Operations dashboard | Review local dispatch activity, workflow metrics, per-module health, and manual or periodic health refreshes. |
| Secure gateway controls | Use authenticated, redacted health checks and an explicit two-step approval flow before an allowlisted job is dispatched. |
| Local data controls | Keep workflow records local by default and clear local data through an explicit confirmation step. |

## Architecture

BlackBox is built as an Expo mobile application with a small TypeScript service layer. The mobile interface uses local-first state and persisted device storage for routine workspace activity. When authorized operations are needed, the managed service communicates with a separately deployed, operator-controlled gateway; that gateway performs allowlisted health probes and forwards approved jobs to the private execution environment.

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile client | Expo SDK 54, React Native, Expo Router, NativeWind, TypeScript | Workspace UI, local records, dashboard, approvals, and gateway controls. |
| Application service | Express, tRPC, Drizzle ORM | Authenticated API routes, admin-only gateway procedures, and optional managed data services. |
| Private operations | Node.js gateway, Docker Compose, Caddy | Token-protected health checks, HMAC-signed job handoff, and private-stack isolation. |

## Local development

### Prerequisites

Use Node.js 22+ and pnpm 9+. Install project dependencies with:

```bash
pnpm install
```

Start the API service and Expo web preview together:

```bash
pnpm dev
```

The following commands are available during development:

| Command | Purpose |
|---|---|
| `pnpm check` | Run TypeScript validation. |
| `pnpm test` | Run the Vitest test suite. |
| `pnpm lint` | Run Expo linting. |
| `pnpm ios` / `pnpm android` | Start an Expo native preview. |
| `pnpm build` | Build the Node application service. |
| `pnpm db:push` | Generate and apply Drizzle database migrations when managed persistence is used. |

## Security model

The application is designed so that private analysis services remain under operator control. Mobile-facing views use authenticated, redacted status information. Gateway access requires an operator token, job requests are constrained to allowlisted actions, and private job forwarding uses HMAC signing. Dispatching is deliberately a two-step approval process.

Do not commit gateway tokens, executor secrets, database credentials, or production configuration files containing real secret values. Configure those values through the deployment environment.

## Deployment notes

The supported production model separates the managed mobile/API service from the operator-controlled Linux host that runs the gateway, executor, and private analysis services. The project includes an `operator-gateway/` package, Docker Compose overlay, Caddy-oriented deployment guidance, and reusable operations documentation under `automation/`.

Before publishing a release, verify TypeScript, tests, gateway/executor sign-off, approval evidence, the recorded project checkpoint, and the rollback plan. The build-to-publish skill documentation includes the corresponding release workflow.

## Project layout

```text
app/                 Expo Router screens and tab layouts
components/          Reusable mobile UI components
lib/                 State, API client, and shared utilities
server/              Express/tRPC application service
operator-gateway/    Private operator gateway and deployment overlay
automation/          Reusable skills and production-operation materials
tests/               Automated validation
```

## Scope and responsible use

BlackBox is intended for authorized security analysis, internal engineering operations, and controlled technical workflows. Operators are responsible for ensuring that access, target selection, data handling, and any private execution environment comply with applicable policies and permissions.
