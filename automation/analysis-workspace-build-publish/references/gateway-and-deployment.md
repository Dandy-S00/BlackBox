# Gateway and Deployment Reference

## Topology

Use a hybrid architecture: mobile app and authenticated API on managed hosting; Docker-based private analysis stack, gateway, and executor on an operator-controlled Linux host. The mobile app calls the authenticated API. The API retains a least-privilege gateway token server-side. The gateway exposes only health and approved-job routes. The executor verifies a signed handoff, target scope, allowed modules, and idempotency before any private operation.

## Production Controls

| Boundary | Required control |
| --- | --- |
| TLS edge | Place a reverse proxy at the only public ingress. Restrict public ports to HTTPS and the certificate challenge path. |
| Gateway | Validate a bearer token, schemas, request size, timeouts, and fixed routes. Do not offer arbitrary commands or tools. |
| Executor | Verify HMAC signature and idempotency key; enforce a separate policy for targets and module combinations. |
| Private stack | Do not bind analyzer, MCP, database, or executor ports publicly. Use internal container networks and least privilege. |
| Secrets | Use protected server-side configuration, lifecycle tracking, rotation, revocation, and audit records. |
| Recovery | Use pinned releases, restart policies, backups, a documented restore test, and a versioned rollback point. |

## Release Gate

Require all of the following before a production deployment: a named approver; environment and target host; scoped services; pinned release version; verified backup; secret source; expected health state; approved test handoff; and rollback action. During verification, check gateway health, execute one authorized non-sensitive test record, verify its receipt, and confirm an audit trail.
