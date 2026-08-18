import { describe, expect, it } from "vitest";
import { summarizeDispatchHistory } from "../lib/dashboard";
import type { AnalysisJob } from "../lib/workspace-model";

const jobs: AnalysisJob[] = [
  { id: "analysis-1", workspaceId: "workspace-1", reference: "Mobile release", targetType: "Mobile package", modules: ["mobsf", "frida"], state: "Review", authorizedAt: "2026-08-18T10:00:00.000Z", createdAt: "2026-08-18T10:00:00.000Z", summary: "", dispatchedAt: "2026-08-18T11:00:00.000Z", gatewayReceiptId: "receipt-1", gatewayStatus: "Accepted" },
  { id: "analysis-2", workspaceId: "workspace-1", reference: "Native release", targetType: "Native binary", modules: ["ghidra"], state: "Complete", authorizedAt: "2026-08-18T12:00:00.000Z", createdAt: "2026-08-18T12:00:00.000Z", summary: "", dispatchedAt: "2026-08-18T13:00:00.000Z", gatewayReceiptId: "receipt-2", gatewayStatus: "Accepted" },
  { id: "analysis-3", workspaceId: "workspace-1", reference: "Local draft", targetType: "Repository", modules: ["git"], state: "Ready", authorizedAt: "2026-08-18T14:00:00.000Z", createdAt: "2026-08-18T14:00:00.000Z", summary: "" },
];

describe("dispatch dashboard aggregation", () => {
  it("summarizes only gateway-accepted local dispatch records", () => { const summary = summarizeDispatchHistory(jobs); expect(summary.totalDispatches).toBe(2); expect(summary.reviewCount).toBe(1); expect(summary.acceptedCount).toBe(2); expect(summary.moduleCounts.mobsf).toBe(1); expect(summary.moduleCounts.ghidra).toBe(1); expect(summary.moduleCounts.git).toBe(0); });
  it("orders recent dispatches with the newest first", () => { expect(summarizeDispatchHistory(jobs).recentDispatches[0].id).toBe("analysis-2"); });
});
