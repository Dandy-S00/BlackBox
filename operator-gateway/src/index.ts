import crypto from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb", type: "application/json" }));

const port = Number(process.env.PORT ?? 3009);
const bearerToken = process.env.GATEWAY_OPERATOR_TOKEN;
const executorUrl = process.env.OPERATOR_EXECUTOR_URL;
const executorSecret = process.env.OPERATOR_EXECUTOR_SECRET;
const dispatchSchema = z.object({
  jobId: z.string().min(8).max(160),
  reference: z.string().min(1).max(200),
  targetType: z.enum(["Native binary", "Mobile package", "Repository", "Database", "Mixed"]),
  modules: z.array(z.enum(["ghidra", "mobsf", "frida", "filesystem", "git", "sqlite"])).min(1).max(6),
  approvedAt: z.string().datetime(),
});

type Probe = { id: string; url: string | undefined; manual?: boolean };
const probes: Probe[] = [
  { id: "ghidra", url: process.env.GHIDRA_HEALTH_URL ?? "http://ghidra-mcp:8081/sse" },
  { id: "mobsf", url: process.env.MOBSF_HEALTH_URL ?? "http://mobsf:8000/api/v1/health" },
  { id: "filesystem", url: process.env.FILESYSTEM_HEALTH_URL ?? "http://mcp-filesystem:8082/sse" },
  { id: "git", url: process.env.GIT_HEALTH_URL ?? "http://mcp-git:8083/sse" },
  { id: "sqlite", url: process.env.SQLITE_HEALTH_URL ?? "http://mcp-sqlite:8084/sse" },
  { id: "frida", url: undefined, manual: true },
];

function tokenMatches(value: string | undefined) {
  if (!bearerToken || !value) return false;
  const expected = Buffer.from(bearerToken);
  const actual = Buffer.from(value);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function requireOperator(req: Request, res: Response, next: NextFunction) {
  const candidate = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!tokenMatches(candidate)) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

app.get("/v1/health", requireOperator, async (_req, res) => {
  const modules = await Promise.all(probes.map(async (probe) => {
    if (probe.manual) return { id: probe.id, status: "manual" as const };
    try {
      const response = await fetch(probe.url!, { signal: AbortSignal.timeout(5_000) });
      return { id: probe.id, status: response.ok ? "healthy" as const : "unavailable" as const };
    } catch {
      return { id: probe.id, status: "unavailable" as const };
    }
  }));
  const healthy = modules.every((module) => module.status === "healthy" || module.status === "manual");
  return res.status(healthy ? 200 : 503).json({ status: healthy ? "Healthy" : "Degraded", modules });
});

app.post("/v1/jobs", requireOperator, async (req, res) => {
  const parsed = dispatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid approved job record" });
  if (!executorUrl || !executorSecret) return res.status(503).json({ error: "Approved-job executor is not configured" });

  const body = JSON.stringify(parsed.data);
  const signature = crypto.createHmac("sha256", executorSecret).update(body).digest("hex");
  try {
    const response = await fetch(executorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": parsed.data.jobId, "X-Gateway-Signature": `sha256=${signature}` },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return res.status(502).json({ error: "Approved-job executor rejected the handoff" });
    const responseBody = await response.json().catch(() => ({})) as { receiptId?: unknown; status?: unknown };
    return res.status(202).json({ receiptId: typeof responseBody.receiptId === "string" ? responseBody.receiptId : parsed.data.jobId, status: typeof responseBody.status === "string" ? responseBody.status : "Accepted" });
  } catch {
    return res.status(502).json({ error: "Approved-job executor could not be reached" });
  }
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.listen(port, "0.0.0.0", () => console.log(`Operator gateway listening on ${port}`));
