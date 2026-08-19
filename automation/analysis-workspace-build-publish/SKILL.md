---
name: analysis-workspace-build-publish
description: Build, secure, validate, package, and hand off a production-oriented mobile Analysis Workspace. Use when creating or extending an Expo mobile app that organizes authorized analysis workflows, includes a private operator gateway, needs local-first records and dashboards, or must be delivered as a downloadable project and reusable skill.
---

# Analysis Workspace Build-to-Publish

## Purpose

Use this workflow to create a mobile, local-first Analysis Workspace for **authorized** engineering and security-review workflows. Keep the mobile client as an organizer and review surface. Keep privileged tool execution, private files, databases, MCP services, and credentials behind an operator-controlled gateway and executor.

## Workflow Decision

1. **New workspace**: initialize a mobile project, write its mobile-specific design plan, and add its flat `todo.md` before implementation.
2. **Existing workspace**: update the plan and append new unchecked items to `todo.md` before changing code.
3. **Private-stack request**: read `references/gateway-and-deployment.md`, retain the allowlisted health and approved-job boundary, and do not expose direct tool execution.
4. **Skill delivery request**: validate this skill, copy it into the project automation assets, and attach the `SKILL.md` path so the user can add or download the installable skill.

## Mandatory Build Workflow

### 1. Define the Product Boundary

Create a mobile-first design plan using `templates/mobile-design.md`. Specify portrait screens, primary user flows, local data entities, the visual system, and what happens outside the device. Build no direct analyzer, database, filesystem, or credential access into the client.

Track all work in `todo.md`. Use local storage by default. Do not add a database, account system, or cloud sync unless the user requests one.

### 2. Build the Local Workspace

Create these local models: `Workspace`, `AnalysisJob`, `Finding`, and `StackModule`. Provide workspace creation, explicit target reference, module selection, authorization acknowledgement, local workflow state, verified finding capture, and clear-local-data controls.

Use accessible iOS-style navigation, clear empty states, real local counts, and one-handed portrait layouts. Include app branding and generated launcher assets before the first checkpoint.

### 3. Add the Secure Gateway Only When Needed

Use the gateway as a **policy boundary**, never a general remote-execution proxy. Limit it to an authenticated health endpoint and a schema-validated approved-job endpoint. Require a distinct operator approval immediately before dispatch. Preserve an independent executor that checks the HMAC signature, idempotency, target scope, and allowed module set.

Store gateway secrets only in server-side secret configuration. Do not request values in chat, expose them to the client, copy them into local app storage, or include them in logs.

### 4. Build the Operations Dashboard

Summarize only actual locally recorded dispatches. Show local dispatch totals, in-review records, acceptance state, module coverage, recent dispatch history, and per-module gateway health. Poll health only through the authenticated server procedure; use a bounded refresh interval and a manual refresh action. Never fabricate remote results.

### 5. Prepare Production Deployment

Read `references/gateway-and-deployment.md` and produce the release intake from `templates/production-release.md`. Keep the managed mobile API separate from the Docker-capable private host. Place the gateway behind TLS, expose only the reverse proxy, and keep analyzers, databases, MCP services, and the executor on internal networks.

Require a named approver, target scope, version, secret source, backup state, expected health, and rollback point before a release or real dispatch. Stop rollout on failed verification.

### 6. Validate and Package

Run relevant automated tests and TypeScript validation. Use mobile screenshot verification for principal screens. Ensure every completed item in `todo.md` is marked `[x]`, then read `todo.md` before creating a checkpoint.

Validate this skill with the skill validator. Copy the final skill directory to `automation/analysis-workspace-build-publish` in the application project. Do not leave generated template examples in the finished skill.

### 7. Deliver and Publish Handoff

Create a checkpoint and attach it to the user. Attach this skill's `SKILL.md` in the same delivery when the user asked for a downloadable reusable skill; the platform will package it as an installable `.skill` artifact. Explain that the user starts application publishing from the project interface after checkpointing; do not initiate publishing on the user’s behalf.

## Non-Negotiable Guardrails

- Never bypass an operator approval, executor policy, HMAC, or idempotency control.
- Never expose private services, tool ports, raw file contents, database statements, or secrets to public clients.
- Never present mock or invented gateway health, dispatch counts, or findings as real data.
- Never commit secrets or write them into app code, local storage, documentation, or skill templates.
- Never publish or run a production change without explicit user confirmation and a documented rollback point.

## Resources

Read `references/gateway-and-deployment.md` for the secure topology and release controls. Copy `templates/mobile-design.md`, `templates/todo.md`, and `templates/production-release.md` into the working project only when creating the respective artifacts.
