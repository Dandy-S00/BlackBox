# Operator Gateway Package

This package is designed to run alongside the supplied private analysis stack. It exposes two narrowly scoped HTTPS API routes: `GET /v1/health` reports a fixed allowlist of stack probes, while `POST /v1/jobs` accepts a small, validated approved-job record and forwards it to an operator-managed executor. It never accepts arbitrary commands, files, shell arguments, database statements, or credentials from the mobile app.

The gateway must be placed behind an operator-controlled HTTPS reverse proxy and should remain reachable only by the WebDev backend through an allowlisted network path. Run it with the provided compose overlay: `docker compose -f docker-compose.yml -f operator-gateway/docker-compose.gateway.yml up -d --build`. The overlay binds the gateway only to loopback; publish it through your own authenticated reverse proxy or equivalent access layer rather than exposing Docker directly.

| Environment variable | Purpose |
| --- | --- |
| `GATEWAY_OPERATOR_TOKEN` | Bearer token accepted from the WebDev backend. Use a long, randomly generated value. |
| `OPERATOR_EXECUTOR_URL` | Internal URL for the service that implements your organization’s approved job policy. |
| `OPERATOR_EXECUTOR_SECRET` | HMAC secret used to sign each approved job handoff to the internal executor. |

The executor must independently verify the `X-Gateway-Signature`, reject duplicate idempotency keys, enforce its own target and module allowlists, and provide a receipt ID. The supplied stack does not define a common execution endpoint, so the executor is intentionally separate and remains under the operator’s control.
