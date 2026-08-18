# Unified Analysis Workspace — Mobile Design

## Product Intent

Unified Analysis Workspace is a **mobile control plane for authorized security research**. It does not run Ghidra, MobSF, Frida, Git, filesystem, or SQLite workloads on the phone. Instead, it gives a researcher a focused way to curate local workspaces, prepare a job for an already configured private analysis stack, monitor status, and review saved findings. This keeps the app appropriate for a portrait mobile device while preserving the separation between the handset and the user-operated analysis infrastructure.

## Mobile Frame and Interaction Principles

The interface is designed for **9:16 portrait orientation** and one-handed operation. Core actions sit in the lower half of the screen or in a native bottom sheet. Bottom tabs give persistent access to the most frequent destinations. Large rounded list rows, clear status chips, and a concise visible hierarchy follow mainstream iOS conventions. Critical actions require a confirmation step and display a visible authorization reminder before a job can be prepared.

## Screen List

| Screen | Primary content and functionality |
| --- | --- |
| **Command Deck** | The landing tab. Shows the current workspace, a concise stack-connection state, an empty-or-recent activity section, and a prominent **Prepare analysis** action. |
| **Workspaces** | A searchable local list of named engagements. Users can create, open, rename, or archive a workspace. Each row shows the saved target type and current state. |
| **New Analysis** | A guided form that selects a workspace, assigns a target type, chooses the authorized analysis modules, records a local target reference, and requires an acknowledgement before a job is saved. |
| **Analysis Detail** | A chronological, locally persisted job record with its selected modules, reference, authorization acknowledgement, state, and summary field. It offers safe editing and an intentional state change to complete or archive a workflow. |
| **Insights** | A local review area for saved findings. It supports filtering by source module and severity and highlights empty states rather than inventing results. |
| **Stack** | A read-only representation of the six supplied services: native-binary analysis, mobile-package assessment, runtime observation, filesystem, repositories, and SQLite. It offers connection setup guidance without exposing secrets or starting remote work. |
| **Settings sheet** | Clears only locally stored workspace data after explicit confirmation and states that remote infrastructure is controlled separately. |

## Domain Model

| Entity | Key fields | Storage boundary |
| --- | --- | --- |
| **Workspace** | `id`, `name`, `targetType`, `createdAt`, `status` | Stored on the device using local application storage. |
| **Analysis Job** | `id`, `workspaceId`, `reference`, `modules`, `state`, `authorizedAt`, `createdAt`, `summary` | Stored on the device. It is a preparation and record object, not an executable remote command. |
| **Finding** | `id`, `jobId`, `source`, `severity`, `title`, `detail`, `createdAt` | Stored locally if a user adds or imports it later. The initial state contains no fabricated findings. |
| **Stack Module** | `id`, `name`, `category`, `capability`, `connectionRequirement` | Static, non-secret interface metadata based on the supplied architecture. |

## Key User Flows

| Flow | Steps |
| --- | --- |
| **Start an authorized analysis record** | Command Deck → **Prepare analysis** → choose or create workspace → select the intended target type → select relevant modules → enter a local reference → acknowledge authorization → save the job record → open Analysis Detail. |
| **Review a workspace** | Workspaces → select a workspace → inspect its job timeline → open a job → update the local workflow state or record a summary. |
| **Understand available capabilities** | Stack → select a module card → read purpose, expected connection method, and safe-use boundary → return to New Analysis to select it for an authorized job record. |
| **Protect local data** | Settings sheet → select **Clear local workspace data** → review confirmation language → confirm → return to the fresh Command Deck state. |

## Visual Language

The visual identity is a dark, calm research workspace rather than a stereotypical “hacker” interface. The brand palette is **Obsidian** `#101620` for the base, **Slate** `#1A2431` for raised surfaces, **Signal Teal** `#2AD4C4` for focused primary actions, **Cloud** `#F4F7FA` for high-contrast foreground text, **Mist** `#9BA9B9` for secondary text, **Amber** `#F3B34C` for attention states, and **Rose** `#E36D77` for destructive states. Soft blue-gray dividers, 16–20 pt corner radii, a generous 20 pt edge inset, and short sentence-case labels establish a native, deliberate feel.

## Technical Boundary

The first release remains **local-first**. Its data is retained in device storage and it does not embed stack credentials or make privileged requests. The supplied Docker workloads require a separately operated Linux host, private networking, specialized tooling, and higher resources than are appropriate for a mobile app. A later integration can add a user-controlled gateway endpoint after the operator provides a secure API contract and authentication model.
