// ============================================================
//  매칭 엔진 — 결정론적 점수 산정 + 분석결과 하이드레이트
//  엔진(Claude/폴백)은 "선택+설명"만, 기관 점수는 여기서 계산.
// ============================================================
import {
  institutions,
  getInstitution,
  getProgram,
  dataSources,
} from "@/lib/dataset";
import type {
  AnalysisResult,
  EnrichedInstitution,
  InstitutionCandidate,
  IntakeRequest,
  PhaseKey,
  PhasePlan,
  ProgramCandidate,
  RawAnalysis,
  ScoreBreakdown,
  StructuredIntake,
  WelfareProgram,
} from "@/lib/types";

export interface MatchSignals {
  needNight: boolean;
  needShortTerm: boolean;
  needActivity: boolean;
  isMinor: boolean;
  targetTags: string[];
}

const CANONICAL_SOURCE_ORDER = dataSources.map((s) => s.name);

function blob(s: StructuredIntake): string {
  return [
    s.targetType,
    s.gapReason,
    s.estimatedGapHours,
    s.location,
    ...(s.disabilityFeatures || []),
    ...(s.riskFactors || []),
    ...(s.currentServices || []),
  ]
    .join(" ")
    .toLowerCase();
}

export function deriveSignals(s: StructuredIntake): MatchSignals {
  const t = blob(s);
  const has = (...ks: string[]) => ks.some((k) => t.includes(k.toLowerCase()));

  const needNight =
    has("야간", "밤", "새벽", "심야", "익일", "내일 오전", "오전까지", "21:", "22:", "23:", "00:", "24시간", "1박");
  const needShortTerm =
    has("입원", "단기", "익일", "내일", "1박", "숙박", "거주", "24시간", "며칠", "퇴원");
  const needActivity = has("활동지원", "활동보조", "활동지원사");
  const isMinor =
    has("아동", "청소년", "미성년", "학생") ||
    /(?:1[0-7]|[1-9])\s*세/.test(s.targetType + " " + (s.disabilityFeatures || []).join(" "));

  const targetTags: string[] = [];
  if (has("발달장애", "자폐", "지적장애")) targetTags.push("발달장애");
  if (has("최중증", "도전행동", "자해")) targetTags.push("최중증");
  if (isMinor) targetTags.push("아동청소년");
  else targetTags.push("성인");
  if (has("중증")) targetTags.push("중증");
  if (needNight) targetTags.push("야간");
  if (needActivity) targetTags.push("활동지원");
  if (has("치매", "고령", "어르신", "노인")) targetTags.push("고령");

  return { needNight, needShortTerm, needActivity, isMinor, targetTags: Array.from(new Set(targetTags)) };
}

function gradeScore(grade?: string | null): number {
  switch (grade) {
    case "A":
      return 15;
    case "B":
      return 11;
    case "C":
      return 6;
    case "D":
      return 2;
    default:
      return 5;
  }
}
function accessScore(level?: string | null): number {
  switch (level) {
    case "우수":
      return 5;
    case "양호":
      return 3;
    case "보통":
      return 1;
    default:
      return 2;
  }
}

export function scoreInstitution(
  inst: EnrichedInstitution,
  sig: MatchSignals
): { score: number; breakdown: ScoreBreakdown } {
  // fit (0-40)
  let fit = 0;
  const overlap = inst.targetTags.filter((tg) => sig.targetTags.includes(tg)).length;
  fit += Math.min(overlap * 8, 24);
  const svc = inst.serviceTypes.join(" ");
  if (sig.needShortTerm && /(단기보호|단기거주|야간돌봄|긴급보호)/.test(svc)) fit += 16;
  if (sig.needActivity && /(활동지원|긴급활동지원)/.test(svc)) fit += 12;
  if (/(발달장애인지원센터|사회서비스원|긴급돌봄)/.test(inst.type + svc)) fit += 10;
  fit = Math.min(fit, 40);

  // night (0-20)
  let night: number;
  if (sig.needNight) night = inst.nightAvailable ? 20 : 2;
  else night = 10;

  // distance (0-20)
  const distance = Math.max(0, Math.min(20, Math.round((20 - inst.distanceKm * 2) * 10) / 10));

  // quality (0-15) / access (0-5)
  const quality = gradeScore(inst.quality?.grade);
  const access = accessScore(inst.accessibility?.level);

  const breakdown: ScoreBreakdown = { fit, night, distance, quality, access };
  const score = Math.max(0, Math.min(100, Math.round(fit + night + distance + quality + access)));
  return { score, breakdown };
}

export function rankInstitutions(
  sig: MatchSignals,
  opts?: { nightOnly?: boolean; limit?: number }
): InstitutionCandidate[] {
  let pool = institutions;
  if (opts?.nightOnly) pool = pool.filter((i) => i.nightAvailable);
  const scored = pool
    .map((inst) => {
      const { score, breakdown } = scoreInstitution(inst, sig);
      return buildInstitutionCandidate(inst, score, breakdown, "", "");
    })
    .sort((a, b) => b.score - a.score);
  return typeof opts?.limit === "number" ? scored.slice(0, opts.limit) : scored;
}

export function institutionDataBasis(inst: EnrichedInstitution): string[] {
  const basis = [inst.sourceDataset];
  if (inst.quality) basis.push("사회서비스 제공기관 품질평가 정보");
  if (inst.accessibility) basis.push("장애인편의시설 현황");
  if (inst.serviceTypes.some((s) => s.includes("활동지원"))) basis.push("장애인활동지원 통계 정보");
  return Array.from(new Set(basis));
}
function programDataBasis(p: WelfareProgram): string[] {
  return [p.level === "중앙" ? "중앙부처복지서비스" : "지자체복지서비스"];
}

function buildInstitutionCandidate(
  inst: EnrichedInstitution,
  score: number,
  breakdown: ScoreBreakdown,
  matchReason: string,
  confirmQuestion: string
): InstitutionCandidate {
  return {
    kind: "기관",
    institution: inst,
    matchReason,
    confirmQuestion,
    dataBasis: institutionDataBasis(inst),
    score,
    breakdown,
  };
}

const PHASE_WINDOW: Record<PhaseKey, string> = {
  "0-2h": "0–2시간 · 즉시 안전 확인",
  "2-24h": "2–24시간 · 임시 돌봄 연결",
  "24-72h": "24–72시간 · 지속 지원 전환",
  "사후": "사후 · 재발 방지 · 리포트",
};

const DEFAULT_ETHICS = [
  "AI는 추천·설명만 제공하며 기관 배정·수급 결정은 담당자가 수행합니다(자동 배정 배제).",
  "최소정보 입력·동의 기반 처리, 민감정보는 기관 내부 범위로 한정합니다.",
  "기관의 실시간 수용 가능 여부는 담당자 전화 확인을 전제로 하며 AI가 단정하지 않습니다.",
  "사후 분석은 비식별·집계 통계만 활용합니다.",
];

/** 엔진이 만든 RawAnalysis → UI 렌더용 AnalysisResult 로 변환(데이터 결합·점수 부여) */
export function hydrate(
  raw: RawAnalysis,
  req: IntakeRequest,
  engine: "claude" | "fallback",
  model: string | null,
  elapsedMs: number
): AnalysisResult {
  const sig = deriveSignals(raw.structured);
  const usedSources = new Set<string>(["장애인활동지원 통계 정보"]);

  const phases: PhasePlan[] = raw.phases.map((rp) => {
    const programs: ProgramCandidate[] = [];
    const insts: InstitutionCandidate[] = [];

    for (const c of rp.candidates) {
      if (c.kind === "제도") {
        const p = getProgram(c.id);
        if (!p) continue;
        const basis = programDataBasis(p);
        basis.forEach((b) => usedSources.add(b));
        programs.push({
          kind: "제도",
          program: p,
          matchReason: c.matchReason || p.urgentUse,
          confirmQuestion: c.confirmQuestion || "자격·신청 조건을 담당부서에 확인",
          dataBasis: basis,
        });
      } else {
        const inst = getInstitution(c.id);
        if (!inst) continue; // 환각 방지: 데이터셋에 없는 기관 id 는 폐기
        const { score, breakdown } = scoreInstitution(inst, sig);
        const cand = buildInstitutionCandidate(
          inst,
          score,
          breakdown,
          c.matchReason || inst.note || "",
          c.confirmQuestion || "현재 수용 가능 여부와 야간 대응 가능성 확인"
        );
        cand.dataBasis.forEach((b) => usedSources.add(b));
        insts.push(cand);
      }
    }
    insts.sort((a, b) => b.score - a.score);

    return {
      phase: rp.phase,
      window: PHASE_WINDOW[rp.phase] ?? rp.phase,
      goal: rp.goal,
      aiSupport: rp.aiSupport,
      workerActions: rp.workerActions || [],
      programs,
      institutions: insts,
      confirmQuestions: rp.confirmQuestions || [],
    };
  });

  const usedDataSources = CANONICAL_SOURCE_ORDER.filter((n) => usedSources.has(n));

  // 정직 게이트: 입력 지역이 데모 데이터셋(성남시)과 다른가 / 정보가 부족한가
  const DATASET_SIGUNGU = "성남시";
  const inputSi = (req.region || raw.structured.location || "").match(/[가-힣]+시/)?.[0] || null;
  const regionMismatch = !!inputSi && inputSi !== DATASET_SIGUNGU;

  const st = raw.structured;
  const meaningful =
    (st.location && !st.location.includes("미상") && st.location !== "성남시 분당구" ? 1 : 0) +
    (st.targetType && !st.targetType.includes("미상") && !["상시돌봄 대상자", "상시돌봄 장애인"].includes(st.targetType) ? 1 : 0) +
    (st.gapReason && !["보호자 돌봄 공백", "보호자 돌봄 지속 곤란"].includes(st.gapReason) ? 1 : 0) +
    (st.currentServices?.[0] && !st.currentServices[0].includes("확인 필요") && !st.currentServices[0].includes("미상") ? 1 : 0) +
    (st.disabilityFeatures?.[0] && st.disabilityFeatures[0] !== "상시 돌봄 필요" ? 1 : 0);
  // 정보 부족: 의미 있는 필드가 1개 이하이거나, AI가 정보 부족으로 긴급도를 낮게(일반·40↓) 판정한 경우
  const lowConfidence = meaningful <= 1 || (raw.urgency.level === "일반" && raw.urgency.score <= 40);

  return {
    caseId: "CB-" + Date.now().toString(36).toUpperCase(),
    region: req.region || raw.structured.location || "성남시 분당구",
    receivedAt: req.occurredAt || "방금 접수",
    structured: raw.structured,
    urgency: raw.urgency,
    phases,
    checklist: raw.checklist || [],
    usedDataSources,
    ethics: DEFAULT_ETHICS,
    regionMismatch,
    lowConfidence,
    engine,
    model,
    elapsedMs,
  };
}
