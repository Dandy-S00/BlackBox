# Production Topology Reference

Use a hybrid deployment: managed mobile API and authentication on one side; operator-controlled Linux host for Docker stack, gateway, executor, and private analyzers on the other. The mobile API authenticates users and carries a least-privilege gateway token server-side. The gateway exposes only health and approved-job endpoints, then sends HMAC-signed records to the executor. The executor enforces target/module policy and produces an audit receipt.

Use a Compose production overlay with restart policies, internal networks, read-only gateway filesystem where practical, dropped capabilities, and no gateway host port. Put Caddy or an equivalent reverse proxy at the only public ingress for the gateway. Bind only ports 80 and 443 at the edge; restrict SSH administration and maintain firewall rules.

Keep gateway, executor, and application secrets in a centralized secret manager or protected server environment. Use least privilege, audit accesses and rotations, do not commit values, and never expose them to the mobile client. Maintain pinned images, backups, a documented rollback command, per-module health checks, and an approved-job receipt audit trail.

For host selection, a self-operated Linux VM or managed Linux computer is required when Docker, system packages, private networking, and OS firewall control are needed. A managed app platform remains suitable for the mobile API but is not a host for the Docker analysis bundle.
