import { z } from "zod";

const moduleIdSchema = z.enum(["ghidra", "mobsf", "frida", "filesystem", "git", "sqlite"]);
export const gatewayDispatchSchema = z.object({
  jobId: z.string().min(8).max(160),
  reference: z.string().min(1).max(200),
  targetType: z.enum(["Native binary", "Mobile package", "Repository", "Database", "Mixed"]),
  modules: z.array(moduleIdSchema).min(1).max(6),
  approval: z.literal(true),
  approvedAt: z.string().datetime(),
});

const gatewayHealthSchema = z.object({
  status: z.enum(["Healthy", "Degraded"]),
  modules: z.array(z.object({ id: moduleIdSchema, status: z.enum(["healthy", "unavailable", "manual"]) })).max(6),
});

export type GatewayDispatchInput = z.infer<typeof gatewayDispatchSchema>;
type Fetcher = typeof fetch;
type GatewayConfig = { baseUrl: string; token: string };

function normalizedBaseUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("Gateway URL must use HTTPS.");
  parsed.pathname = parsed.pathname.replace(/\/$/, "");
  return parsed.toString().replace(/\/$/, "");
}

export class OperatorGateway {
  constructor(private config: GatewayConfig | null, private fetcher: Fetcher = fetch) {}

  get status() {
    if (!this.config) return { configured: false as const, endpoint: null };
    return { configured: true as const, endpoint: new URL(this.config.baseUrl).host };
  }

  private requestHeaders() {
    if (!this.config) throw new Error("The operator gateway is not configured.");
    return { Authorization: `Bearer ${this.config.token}`, Accept: "application/json" };
  }

  async health() {
    if (!this.config) return { configured: false as const, reachable: false, status: "Not configured", modules: [] as Array<{ id: z.infer<typeof moduleIdSchema>; status: "healthy" | "unavailable" | "manual" }> };
    try {
      const response = await this.fetcher(`${this.config.baseUrl}/v1/health`, { headers: this.requestHeaders(), signal: AbortSignal.timeout(8_000) });
      const payload = gatewayHealthSchema.safeParse(await response.json().catch(() => null));
      if (!payload.success) return { configured: true as const, reachable: false, status: "Unavailable", modules: [] as Array<{ id: z.infer<typeof moduleIdSchema>; status: "healthy" | "unavailable" | "manual" }> };
      return { configured: true as const, reachable: true, status: payload.data.status, modules: payload.data.modules };
    } catch {
      return { configured: true as const, reachable: false, status: "Unavailable", modules: [] as Array<{ id: z.infer<typeof moduleIdSchema>; status: "healthy" | "unavailable" | "manual" }> };
    }
  }

  async dispatch(input: GatewayDispatchInput) {
    if (!this.config) throw new Error("The operator gateway is not configured.");
    const safeInput = gatewayDispatchSchema.parse(input);
    const response = await this.fetcher(`${this.config.baseUrl}/v1/jobs`, {
      method: "POST",
      headers: { ...this.requestHeaders(), "Content-Type": "application/json", "Idempotency-Key": safeInput.jobId },
      body: JSON.stringify({ jobId: safeInput.jobId, reference: safeInput.reference, targetType: safeInput.targetType, modules: safeInput.modules, approvedAt: safeInput.approvedAt }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    if (!response || !response.ok) throw new Error("Gateway dispatch was not accepted.");
    const body = await response.json().catch(() => ({})) as { receiptId?: unknown; status?: unknown };
    return { receiptId: typeof body.receiptId === "string" ? body.receiptId : safeInput.jobId, status: typeof body.status === "string" ? body.status : "Accepted" };
  }
}

export function getOperatorGateway() {
  const rawUrl = process.env.GATEWAY_BASE_URL?.trim();
  const token = process.env.GATEWAY_OPERATOR_TOKEN?.trim();
  if (!rawUrl || !token) return new OperatorGateway(null);
  try {
    return new OperatorGateway({ baseUrl: normalizedBaseUrl(rawUrl), token });
  } catch {
    return new OperatorGateway(null);
  }
}
