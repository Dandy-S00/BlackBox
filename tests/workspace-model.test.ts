import { describe, expect, it } from "vitest";
import { AnalysisDraft, validateAnalysisDraft } from "../lib/workspace-model";
const validDraft: AnalysisDraft = { workspaceId: "workspace-1", reference: "Approved sample build", targetType: "Mobile package", modules: ["mobsf"], acknowledged: true };
describe("analysis record validation", () => { it("accepts a complete authorized analysis draft", () => { expect(validateAnalysisDraft(validDraft)).toBeNull(); }); it("requires an explicit authorization acknowledgement", () => { expect(validateAnalysisDraft({ ...validDraft, acknowledged: false })).toContain("authorized"); }); it("rejects drafts with no selected analysis modules", () => { expect(validateAnalysisDraft({ ...validDraft, modules: [] })).toContain("module"); }); });
