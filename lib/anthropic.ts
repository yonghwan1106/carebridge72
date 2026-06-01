// ============================================================
//  실제 Claude API 호출(경량) → { structured, urgency } 만 파싱·검증.
//  출력이 작아 빠르고 안정적. 실패 시 throw → analyze.ts 폴백 전환.
// ============================================================
import Anthropic from "@anthropic-ai/sdk";
import { buildStructurePrompt } from "@/lib/prompt";
import type { IntakeRequest, StructuredIntake, UrgencyAssessment, UrgencyLevel } from "@/lib/types";

const VALID_LEVELS: UrgencyLevel[] = ["즉시", "당일", "72시간", "일반"];

function extractJson(text: string): string {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return t;
}

function asArray(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean).slice(0, max);
}

function normalizeStructured(s: any): StructuredIntake {
  if (!s || typeof s !== "object") throw new Error("structured 누락");
  const out: StructuredIntake = {
    targetType: String(s.targetType || "상시돌봄 대상자").slice(0, 80),
    disabilityFeatures: asArray(s.disabilityFeatures, 8),
    gapReason: String(s.gapReason || "보호자 돌봄 공백").slice(0, 80),
    estimatedGapHours: String(s.estimatedGapHours || "24시간 내외").slice(0, 60),
    location: String(s.location || "").slice(0, 60),
    currentServices: asArray(s.currentServices, 6),
    riskFactors: asArray(s.riskFactors, 8),
    missingQuestions: asArray(s.missingQuestions, 4),
  };
  if (out.disabilityFeatures.length === 0) out.disabilityFeatures.push("상시 돌봄 필요");
  if (out.riskFactors.length === 0) out.riskFactors.push("돌봄 공백에 따른 안전 위험");
  return out;
}

function normalizeUrgency(u: any): UrgencyAssessment {
  if (!u || typeof u !== "object") throw new Error("urgency 누락");
  const level: UrgencyLevel = VALID_LEVELS.includes(u.level) ? u.level : "당일";
  let score = Number(u.score);
  if (!Number.isFinite(score)) score = 60;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    level,
    score,
    rationale: String(u.rationale || "").slice(0, 400),
    safetyFlags: asArray(u.safetyFlags, 4),
  };
}

export async function analyzeStructureWithClaude(
  req: IntakeRequest,
  apiKey: string
): Promise<{ structured: StructuredIntake; urgency: UrgencyAssessment; model: string }> {
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5-20251001";
  // 출력이 작아 빠름. 25초 타임아웃 + 재시도 1회.
  const client = new Anthropic({ apiKey, timeout: 25000, maxRetries: 1 });
  const { system, user } = buildStructurePrompt(req);

  const resp = await client.messages.create({
    model,
    max_tokens: 1200,
    temperature: 0.2,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = resp.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const parsed = JSON.parse(extractJson(text));
  return {
    structured: normalizeStructured(parsed.structured),
    urgency: normalizeUrgency(parsed.urgency),
    model,
  };
}
