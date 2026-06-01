// ============================================================
//  하이브리드 오케스트레이터
//  - Claude(있으면): 비정형 상담 → 구조화 + 긴급도 분류 (NLU, 빠름)
//  - 공공데이터 매칭 엔진: 72시간 대응안·기관 후보·점수 (결정론적)
//  Claude 실패/지연 시 구조화·긴급도도 규칙 엔진으로 끊김 없이 폴백.
// ============================================================
import { analyzeStructureWithClaude } from "@/lib/anthropic";
import { extractStructured, assessUrgency, buildPhases, buildChecklist } from "@/lib/fallback";
import { deriveSignals, hydrate } from "@/lib/matching";
import type { AnalysisResult, IntakeRequest, StructuredIntake, UrgencyAssessment } from "@/lib/types";

export async function runAnalysis(req: IntakeRequest): Promise<AnalysisResult> {
  const start = Date.now();
  const key = process.env.ANTHROPIC_API_KEY?.trim();

  let structured: StructuredIntake | null = null;
  let urgency: UrgencyAssessment | null = null;
  let engine: "claude" | "fallback" = "fallback";
  let model: string | null = null;

  if (key) {
    try {
      const r = await analyzeStructureWithClaude(req, key);
      structured = r.structured;
      urgency = r.urgency;
      model = r.model;
      engine = "claude";
    } catch (e) {
      console.error("[carebridge72] Claude 구조화 실패 → 규칙 엔진 폴백:", (e as Error)?.message || e);
    }
  }

  if (!structured || !urgency) {
    structured = extractStructured(req.text, req);
    urgency = assessUrgency(structured, deriveSignals(structured));
    engine = "fallback";
    model = null;
  }

  // 72시간 대응안·기관 후보는 공공데이터 매칭 엔진이 결정론적으로 생성
  const sig = deriveSignals(structured);
  const raw = {
    structured,
    urgency,
    phases: buildPhases(sig),
    checklist: buildChecklist(),
  };

  return hydrate(raw, req, engine, model, Date.now() - start);
}
