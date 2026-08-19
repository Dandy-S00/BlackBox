---
name: analysis-workspace-production-ops
description: Securely plan, validate, and document production deployment of an Analysis Workspace mobile backend, operator gateway, approved-job executor, and private Docker analysis stack. Use when deploying, updating, operating, or recovering these services, including secret rotation, gateway health checks, release approvals, and production topology decisions.
---

# Analysis Workspace Production Ops

## Scope and Safety Boundary

Use this skill only for an authorized Analysis Workspace environment. Maintain the split between the managed mobile API and the operator-controlled private stack. Preserve the gateway’s narrow API: health reporting and approved-job records only. Never turn it into an arbitrary command, file, database, shell, or MCP proxy.

Do not obtain, reveal, log, commit, or place secret values in the mobile client. Use secure environment configuration for secret values and refer only to variable names in reports.

## Select the Hosting Topology

1. Keep the mobile application and TypeScript API on the managed platform when they need standard HTTPS, server-side secrets, authentication, and a dashboard.
2. Put Docker-bound analyzers, the gateway, and the executor on an operator-controlled Linux host because they require Docker, firewall control, persistent data, and private networking.
3. Use the self-hosted gateway with a TLS reverse proxy. Expose only the reverse proxy; keep all analyzers, MCP services, databases, and executor routes on internal networks.
4. Read `references/topology.md` before recommending host options, composing the release plan, or explaining the controls.

## Mandatory Workflow

1. Classify the request as initial deployment, approved release, verification, incident recovery, or secret rotation.
2. Collect release version, named approver, target environment, scope, health expectation, backup status, and rollback point. Stop if any are absent.
3. Validate the gateway remains limited to `GET /v1/health` and `POST /v1/jobs`; validate the executor independently verifies HMAC, idempotency, target, and module policy.
4. Confirm secrets are server-side, ports are restricted, public TLS terminates at the reverse proxy, and private services have no host-port exposure.
5. Ask for explicit approval before changing production services or dispatching any real job.
6. Deploy one approved service at a time with pinned versions; verify health, then verify one approved test handoff and its audit receipt.
7. Record the release result, approver, version, health state, receipt IDs, rollback readiness, and follow-up work. On any failed acceptance check, stop rollout and recommend rollback.

## Deliverables

Create a deployment plan, approved change record, validation summary, and an operator handoff. Use `templates/deployment-intake.md` as the intake record. For detailed topology and operational controls, read `references/topology.md`.
