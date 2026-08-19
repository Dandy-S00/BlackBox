# CI Release Checklist and Approval Evidence

## Release Identity

| Field | Evidence |
| --- | --- |
| Product and environment | |
| Release version and source revision | |
| Build run URL or identifier | |
| Artifact name, checksum, and storage location | |
| Release owner | |
| Planned publish or deployment window | |

## Required CI Evidence

| Gate | Required result | Evidence link or identifier | Recorded by |
| --- | --- | --- | --- |
| Source review | Protected branch / required review completed | | |
| Dependency and secret scan | No unresolved blocking finding | | |
| Unit and integration tests | Required suite passed | | |
| Type, lint, and build checks | All required checks passed | | |
| Mobile smoke verification | Principal user flow verified | | |
| Artifact provenance | Version and checksum match reviewed source | | |
| Backup and rollback readiness | Backup verified; rollback artifact identified | | |

## Approval Evidence

> Do not publish or deploy until a named approver supplies the evidence below. A checkmark without the evidence reference is not approval.

| Approval | Name and role | Timestamp | Evidence reference or signed change record |
| --- | --- | --- | --- |
| Release scope and target environment approved | | | |
| Security and secret-handling review approved | | | |
| Rollback plan approved | | | |
| Final publication or deployment approved | | | |

## Outcome Record

| Field | Value |
| --- | --- |
| Publication or deployment result | |
| Published version / deployment receipt | |
| Post-release health check evidence | |
| Rollback invoked? | Yes / No — reference |
| Follow-up owner and due date | |
