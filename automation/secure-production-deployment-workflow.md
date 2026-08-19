# Secure Production Deployment Workflow

## Trigger

Run this workflow when the Analysis Workspace backend, operator gateway, executor, or private analysis services need an initial production deployment, configuration change, or versioned release.

## Mandatory Inputs

| Input | Required evidence |
| --- | --- |
| Change request | Named operator, scope, reason, and desired release identifier. |
| Target scope | Approved environment, service names, and rollback owner. |
| Security review | Confirmed secret source, network boundary, and explicit approval policy. |
| Recovery plan | Last known-good image or checkpoint, backup status, and rollback command. |

## Workflow

1. **Classify the change.** Treat gateway or executor policy changes as high-risk. Reject requests that include arbitrary commands, unscoped targets, raw credentials, or unreviewed executors.
2. **Choose the host plane.** Keep the mobile API managed; place Docker-bound gateway, executor, and analyzers on an operator-controlled Linux host.
3. **Prepare a release record.** Pin image versions, record configuration differences, update the change log, and verify the current backup.
4. **Check secrets and network boundaries.** Use a secure secret store or protected environment file. Ensure only the TLS reverse proxy has public ports and that internal services have no host bindings.
5. **Obtain approval.** Ask the named operator to approve the exact release, target host, expected health state, and rollback action before any production change.
6. **Deploy one component at a time.** Apply the Compose production overlay, wait for the component to become healthy, and do not silently recreate dependencies.
7. **Verify end-to-end.** Authenticate as an operator, request stack health, dispatch one approved test record, verify the executor receipt, and inspect the audit record.
8. **Close or roll back.** If acceptance conditions fail, run the documented rollback. Otherwise, record version, timestamps, health state, approver, receipt, and any follow-up work.

## Non-Negotiable Guardrails

- Never ask for, paste, log, commit, or return production secret values.
- Never turn a health-check or approved-job interface into a shell, MCP, database, or file-execution proxy.
- Never deploy directly from an unreviewed branch or an unpinned container tag.
- Never automatically dispatch a real job; require explicit operator approval every time.
- Never expose private MCP, database, or analyzer ports to the public internet.
