# Production Deployment Blueprint

## Recommended Topology

Deploy the **mobile application and its TypeScript API** on the managed application platform, and deploy the **private analysis stack, operator gateway, and approved-job executor** on a separately controlled Linux host. This preserves the current server-side secret boundary while giving the analysis stack the Docker, firewall, persistent disk, and operating-system control it requires.

```text
Mobile client
    │ authenticated API calls
    ▼
Managed mobile API and dashboard backend
    │ HTTPS + least-privilege gateway token
    ▼
Public TLS reverse proxy ──► Operator gateway ──► Approved-job executor
                              │                     │
                              └── allowlisted probes ┴── private analysis services
```

The gateway must remain a **narrow policy boundary**. Its public surface is limited to `GET /v1/health` and `POST /v1/jobs`. It must not accept shell commands, arbitrary tool names, file content, database statements, or credentials from the client. The executor independently validates the HMAC signature, idempotency key, target scope, and allowed module combination before creating work.

## Hosting Choices

| Approach | Trade-offs | Cost | Setup complexity |
| --- | --- | --- | --- |
| **Managed API plus a self-operated Linux host** — recommended | Keeps the app backend managed while placing Docker analyzers and private data under your own network and firewall policy. | Existing infrastructure cost, or the cost of a chosen host. | Medium. |
| **Managed API plus a managed Linux cloud computer** | Gives the gateway and Docker stack persistent Ubuntu, fixed networking, Docker, and system services without operating a separate provider account. The Standard tier provides 4 GB memory; use it only after confirming capacity with realistic workloads. | Basic starts at $10/month; Standard is $30/month; traffic and storage overages may apply. | Medium. |
| **A single managed application process for everything** | Lowest operations overhead, but unsuitable for the supplied Docker-based analysis stack because it lacks the required OS-level container control. | Usage-based. | Low, but does not meet the stack requirements. |

If no cloud computer is attached and you prefer the managed Linux option, create one from [My Computer settings](https://manus.im/app#settings/my-computer/create). If you already own one, attach it from the computer icon below the chat input instead. Ensure automatic startup, backups, a restrictive firewall, and capacity monitoring are configured before production traffic.

## Deployment Procedure

| Stage | Operator action | Acceptance condition |
| --- | --- | --- |
| **1. Prepare** | Create a production DNS name, create a least-privilege gateway token and executor HMAC secret, and place them in a secret manager or protected environment file. | No secret is committed to Git, copied into the mobile client, or logged. |
| **2. Harden host** | Patch the Linux host, restrict inbound traffic to SSH administration and HTTPS, use SSH keys, and configure automatic service recovery. | The analysis containers have no public host ports. |
| **3. Deploy stack** | Run the base Compose file with `operator-gateway/docker-compose.production.yml`; deploy Caddy using the supplied `Caddyfile`. | Only the reverse proxy exposes ports 80/443; gateway binds only to its container network. |
| **4. Configure managed API** | Set `GATEWAY_BASE_URL` to the HTTPS gateway address and set `GATEWAY_OPERATOR_TOKEN` in server-side project secrets. | The dashboard reports the configured endpoint without exposing the token. |
| **5. Verify** | Authenticate as an operator, refresh health, dispatch one approved non-sensitive test record, and verify the executor audit receipt. | Health is per-module, dispatch is idempotent, and the executor records an approval trail. |
| **6. Operate** | Monitor health and audit logs, rotate gateway and executor secrets on a documented schedule, test restore procedures, and update one service at a time. | Alerts, recovery owners, and rollback steps are documented. |

Docker’s production guidance supports using an additional production-specific Compose file, setting restart policies, changing production environment settings, and deploying individual updated services with a Compose overlay.[1] Caddy can obtain and renew HTTPS certificates when DNS points to the host and ports 80 and 443 reach the reverse proxy.[2] Secrets should be centralized, protected by fine-grained access controls, and rotated with an auditable lifecycle.[3]

> **Release gate:** Do not dispatch or deploy from an agent automatically. Require a named operator to approve the target, selected modules, release version, and rollback point at each production change.

## Repository Assets

| Asset | Purpose |
| --- | --- |
| `operator-gateway/docker-compose.production.yml` | Production overlay that keeps the gateway off host ports and places Caddy at the TLS edge. |
| `operator-gateway/deploy/Caddyfile` | HTTPS reverse-proxy configuration for the gateway’s public domain. |
| `automation/secure-production-deployment-workflow.md` | Human-and-agent workflow with explicit approval gates. |
| `automation/production-operations-agent.md` | Reusable agent role and operating constraints. |
| `analysis-workspace-production-ops.skill` | Installable reusable skill generated from the skill package. |

## Release Commands

Create a protected production environment file outside the repository, then run the deployment from the directory containing the original `docker-compose.yml`:

```bash
docker compose \
  --env-file /etc/analysis-workspace/production.env \
  -f docker-compose.yml \
  -f operator-gateway/docker-compose.production.yml \
  up -d --build
```

For a single approved component update, rebuild and recreate only that component after recording the current image digest and confirming a rollback command. Do not use `latest` tags for production releases.

## Operations Checklist

| Control | Minimum production expectation |
| --- | --- |
| **Authentication** | Managed API enforces authenticated, operator-authorized gateway procedures. Gateway validates a bearer token in constant time. Executor verifies HMAC and idempotency. |
| **Network** | Only Caddy exposes TLS. All analyzers, databases, MCP services, and the executor stay on internal networks. |
| **Secrets** | Store gateway and executor secrets server-side; rotate and revoke them; never return them in APIs or logs. |
| **Auditability** | Record operator identity, approved job ID, modules, target reference, receipt ID, time, and outcome. Do not log sensitive payload content. |
| **Recovery** | Use restart policies, automated disk snapshots, encrypted off-host backups, and documented restore drills. |
| **Observability** | Alert on Caddy TLS failures, gateway authentication failures, health degradation, rejected handoffs, disk pressure, and backup failure. |

## References

[1]: https://docs.docker.com/compose/how-tos/production/ "Docker: Use Compose in production"
[2]: https://caddyserver.com/docs/quick-starts/reverse-proxy "Caddy: Reverse proxy quick-start"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html "OWASP: Secrets Management Cheat Sheet"
