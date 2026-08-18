import { AnalysisJob, ModuleId } from "@/lib/workspace-model";

export interface DispatchDashboard {
  totalDispatches: number;
  reviewCount: number;
  acceptedCount: number;
  moduleCounts: Record<ModuleId, number>;
  recentDispatches: AnalysisJob[];
}

const moduleIds: ModuleId[] = ["ghidra", "mobsf", "frida", "filesystem", "git", "sqlite"];

export function summarizeDispatchHistory(jobs: AnalysisJob[]): DispatchDashboard {
  const dispatched = jobs.filter((job) => Boolean(job.gatewayReceiptId));
  const moduleCounts = Object.fromEntries(moduleIds.map((id) => [id, 0])) as Record<ModuleId, number>;
  dispatched.forEach((job) => job.modules.forEach((id) => { moduleCounts[id] += 1; }));
  return {
    totalDispatches: dispatched.length,
    reviewCount: jobs.filter((job) => job.state === "Review").length,
    acceptedCount: dispatched.filter((job) => job.gatewayStatus === "Accepted").length,
    moduleCounts,
    recentDispatches: [...dispatched].sort((a, b) => (b.dispatchedAt ?? b.createdAt).localeCompare(a.dispatchedAt ?? a.createdAt)).slice(0, 5),
  };
}
