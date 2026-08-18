export type TargetType = "Native binary" | "Mobile package" | "Repository" | "Database" | "Mixed";
export type WorkflowState = "Draft" | "Ready" | "Review" | "Complete" | "Archived";
export type FindingSeverity = "Critical" | "High" | "Medium" | "Low" | "Info";
export type ModuleId = "ghidra" | "mobsf" | "frida" | "filesystem" | "git" | "sqlite";

export interface StackModule {
  id: ModuleId;
  name: string;
  shortName: string;
  category: string;
  capability: string;
  boundary: string;
  connection: string;
  tint: string;
}

export interface Workspace {
  id: string;
  name: string;
  targetType: TargetType;
  createdAt: string;
  status: "Active" | "Archived";
}

export interface AnalysisJob {
  id: string;
  workspaceId: string;
  reference: string;
  targetType: TargetType;
  modules: ModuleId[];
  state: WorkflowState;
  authorizedAt: string;
  createdAt: string;
  summary: string;
}

export interface Finding {
  id: string;
  jobId: string;
  source: ModuleId;
  severity: FindingSeverity;
  title: string;
  detail: string;
  createdAt: string;
}

export interface WorkspaceData {
  workspaces: Workspace[];
  jobs: AnalysisJob[];
  findings: Finding[];
}

export interface AnalysisDraft {
  workspaceId: string;
  reference: string;
  targetType: TargetType;
  modules: ModuleId[];
  acknowledged: boolean;
}

export const TARGET_TYPES: TargetType[] = ["Native binary", "Mobile package", "Repository", "Database", "Mixed"];
export const FINDING_SEVERITIES: FindingSeverity[] = ["Critical", "High", "Medium", "Low", "Info"];
export const EMPTY_WORKSPACE_DATA: WorkspaceData = { workspaces: [], jobs: [], findings: [] };

export const STACK_MODULES: StackModule[] = [
  { id: "ghidra", name: "Native binary analysis", shortName: "Ghidra", category: "Binary workspace", capability: "Organize native-file review and decompilation notes for approved targets.", boundary: "Analysis runs on your separately operated private host, never on this device.", connection: "Private stack gateway", tint: "#7DD3FC" },
  { id: "mobsf", name: "Mobile package assessment", shortName: "MobSF", category: "Package review", capability: "Track static and dynamic mobile-package assessment work for approved applications.", boundary: "Package handling and assessment remain within the operator-managed environment.", connection: "Private stack gateway", tint: "#A7F3D0" },
  { id: "frida", name: "Runtime observation", shortName: "Runtime", category: "Instrumented session", capability: "Record an authorized runtime-observation workflow against a designated test device.", boundary: "Use only on devices and applications you own or are authorized to test.", connection: "Operator-controlled test device", tint: "#FDE68A" },
  { id: "filesystem", name: "Controlled files", shortName: "Files", category: "Evidence workspace", capability: "Maintain references to approved analysis materials and associated evidence.", boundary: "This app stores references; scoped file access is configured on the remote host.", connection: "Scoped workspace mount", tint: "#C4B5FD" },
  { id: "git", name: "Repository context", shortName: "Git", category: "Source review", capability: "Coordinate source and commit-review work inside an authorized repository scope.", boundary: "Repository credentials and operations are not stored in this mobile client.", connection: "Scoped repository service", tint: "#FBCFE8" },
  { id: "sqlite", name: "SQLite reference", shortName: "SQLite", category: "Data review", capability: "Keep a local record of database-focused questions for approved sources.", boundary: "Database access policy is enforced by a separately operated service.", connection: "Scoped database service", tint: "#BAE6FD" },
];

export const moduleById = (id: ModuleId) => STACK_MODULES.find((module) => module.id === id) ?? STACK_MODULES[0];
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
export const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export function validateAnalysisDraft(draft: AnalysisDraft): string | null {
  if (!draft.workspaceId) return "Choose a workspace before saving this analysis record.";
  if (!draft.reference.trim()) return "Add a local target reference so this record remains traceable.";
  if (draft.modules.length === 0) return "Select at least one analysis module.";
  if (!draft.acknowledged) return "Confirm that you are authorized to assess this target.";
  return null;
}
