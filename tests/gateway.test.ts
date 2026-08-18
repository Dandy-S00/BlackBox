import { describe, expect, it } from "vitest";
import { OperatorGateway, gatewayDispatchSchema } from "../server/gateway";

const approvedInput = { jobId: "analysis-12345678", reference: "Approved build", targetType: "Mobile package" as const, modules: ["mobsf"] as "mobsf"[], approval: true as const, approvedAt: "2026-08-18T12:00:00.000Z" };
describe("operator gateway safeguards", () => {
  it("requires an explicit approval flag in every dispatch payload", () => { expect(() => gatewayDispatchSchema.parse({ ...approvedInput, approval: false })).toThrow(); });
  it("uses the configured operator credential for a lightweight health request", async () => { let headers: HeadersInit | undefined; const gateway = new OperatorGateway({ baseUrl: "https://gateway.example.test", token: "operator-token" }, async (_url, init) => { headers = init?.headers; return new Response(JSON.stringify({ status: "Healthy", modules: [{ id: "mobsf", status: "healthy" }] }), { status: 200 }); }); await expect(gateway.health()).resolves.toMatchObject({ configured: true, reachable: true, status: "Healthy" }); expect(headers).toMatchObject({ Authorization: "Bearer operator-token" }); });
  it("uses an authenticated and idempotent dispatch request", async () => { let request: RequestInit | undefined; const gateway = new OperatorGateway({ baseUrl: "https://gateway.example.test", token: "operator-token" }, async (_url, init) => { request = init; return new Response(JSON.stringify({ receiptId: "receipt-42", status: "Accepted" }), { status: 202 }); }); const result = await gateway.dispatch(approvedInput); expect(result.receiptId).toBe("receipt-42"); expect(request?.headers).toMatchObject({ Authorization: "Bearer operator-token", "Idempotency-Key": "analysis-12345678" }); });
  it("reports an unconfigured gateway without exposing a credential", () => { const gateway = new OperatorGateway(null); expect(gateway.status).toEqual({ configured: false, endpoint: null }); });
});
