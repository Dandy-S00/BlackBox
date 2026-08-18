import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnalysisJob, EMPTY_WORKSPACE_DATA, Finding, FindingSeverity, ModuleId, TargetType, WorkflowState, Workspace, WorkspaceData, createId } from "@/lib/workspace-model";

const STORAGE_KEY = "unified-analysis-workspace:v1";

interface WorkspaceContextValue extends WorkspaceData {
  ready: boolean;
  createWorkspace: (name: string, targetType: TargetType) => Workspace | null;
  archiveWorkspace: (workspaceId: string) => void;
  createJob: (input: { workspaceId: string; reference: string; targetType: TargetType; modules: ModuleId[]; acknowledgedAt: string }) => AnalysisJob;
  updateJob: (jobId: string, changes: Partial<Pick<AnalysisJob, "state" | "summary" | "dispatchedAt" | "gatewayReceiptId" | "gatewayStatus">>) => void;
  createFinding: (input: { jobId: string; source: ModuleId; severity: FindingSeverity; title: string; detail: string }) => Finding | null;
  setJobState: (jobId: string, state: WorkflowState) => void;
  clearLocalData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function parseStoredData(value: string | null): WorkspaceData {
  if (!value) return EMPTY_WORKSPACE_DATA;
  try {
    const parsed = JSON.parse(value) as Partial<WorkspaceData>;
    return { workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [], jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [], findings: Array.isArray(parsed.findings) ? parsed.findings : [] };
  } catch {
    return EMPTY_WORKSPACE_DATA;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorkspaceData>(EMPTY_WORKSPACE_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => { if (active) setData(parseStoredData(stored)); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const commit = useCallback((updater: (current: WorkspaceData) => WorkspaceData) => {
    setData((current) => {
      const next = updater(current);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const createWorkspace = useCallback((name: string, targetType: TargetType) => {
    const cleanName = name.trim();
    if (!cleanName) return null;
    const workspace: Workspace = { id: createId("workspace"), name: cleanName, targetType, createdAt: new Date().toISOString(), status: "Active" };
    commit((current) => ({ ...current, workspaces: [workspace, ...current.workspaces] }));
    return workspace;
  }, [commit]);

  const archiveWorkspace = useCallback((workspaceId: string) => commit((current) => ({ ...current, workspaces: current.workspaces.map((workspace) => workspace.id === workspaceId ? { ...workspace, status: "Archived" } : workspace) })), [commit]);

  const createJob = useCallback((input: { workspaceId: string; reference: string; targetType: TargetType; modules: ModuleId[]; acknowledgedAt: string }) => {
    const job: AnalysisJob = { id: createId("analysis"), workspaceId: input.workspaceId, reference: input.reference.trim(), targetType: input.targetType, modules: input.modules, state: "Ready", authorizedAt: input.acknowledgedAt, createdAt: new Date().toISOString(), summary: "" };
    commit((current) => ({ ...current, jobs: [job, ...current.jobs] }));
    return job;
  }, [commit]);

  const updateJob = useCallback((jobId: string, changes: Partial<Pick<AnalysisJob, "state" | "summary" | "dispatchedAt" | "gatewayReceiptId" | "gatewayStatus">>) => commit((current) => ({ ...current, jobs: current.jobs.map((job) => job.id === jobId ? { ...job, ...changes } : job) })), [commit]);
  const setJobState = useCallback((jobId: string, state: WorkflowState) => updateJob(jobId, { state }), [updateJob]);
  const createFinding = useCallback((input: { jobId: string; source: ModuleId; severity: FindingSeverity; title: string; detail: string }) => {
    if (!input.title.trim()) return null;
    const finding: Finding = { id: createId("finding"), jobId: input.jobId, source: input.source, severity: input.severity, title: input.title.trim(), detail: input.detail.trim(), createdAt: new Date().toISOString() };
    commit((current) => ({ ...current, findings: [finding, ...current.findings] }));
    return finding;
  }, [commit]);
  const clearLocalData = useCallback(async () => { setData(EMPTY_WORKSPACE_DATA); await AsyncStorage.removeItem(STORAGE_KEY); }, []);

  const value = useMemo(() => ({ ...data, ready, createWorkspace, archiveWorkspace, createJob, updateJob, createFinding, setJobState, clearLocalData }), [archiveWorkspace, clearLocalData, createFinding, createJob, createWorkspace, data, ready, setJobState, updateJob]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
