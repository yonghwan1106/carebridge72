// ============================================================
//  폴백(규칙 기반) 분석 엔진 — API 키 없이도 데이터셋 기반으로
//  현실적인 72시간 대응안을 생성한다. (하이브리드의 안전망)
// ============================================================
import { allPrograms, institutions } from "@/lib/dataset";
import { deriveSignals, rankInstitutions, type MatchSignals } from "@/lib/matching";
import type {
  IntakeRequest,
  RawAnalysis,
  RawCandidate,
  RawPhase,
  StructuredIntake,
  UrgencyAssessment,
} from "@/lib/types";

function pick(text: string, ...ks: string[]): boolean {
  const t = text.toLowerCase();
  return ks.some((k) => t.includes(k.toLowerCase()));
}

export function extractStructured(text: string, req: IntakeRequest): StructuredIntake {
  const ageMatch = text.match(/(\d{1,3})\s*세/);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : null;
  const isDevelopmental = pick(text, "발달장애", "자폐", "지적장애");
  const isSevere = pick(text, "최중증", "도전행동", "자해");

  const targetType =
    (age ? `${age}세 ` : "") +
    (isDevelopmental ? (isSevere ? "최중증 발달장애인" : "발달장애인") : pick(text, "치매", "고령", "어르신") ? "치매·고령 돌봄대상" : "상시돌봄 장애인");

  const disabilityFeatures: string[] = [];
  if (pick(text, "의사소통")) disabilityFeatures.push("의사소통 제한");
  if (pick(text, "불안")) disabilityFeatures.push("야간 불안");
  if (pick(text, "자해")) disabilityFeatures.push("자해 위험");
  if (pick(text, "도전행동")) disabilityFeatures.push("도전행동");
  if (pick(text, "복약", "약")) disabilityFeatures.push("복약 관리 필요");
  if (pick(text, "이동", "휠체어")) disabilityFeatures.push("이동 지원 필요");
  if (disabilityFeatures.length === 0) disabilityFeatures.push("상시 돌봄 필요");

  let gapReason = "보호자 돌봄 지속 곤란";
  if (pick(text, "입원", "응급", "쓰러")) gapReason = "주 보호자 응급 입원";
  else if (pick(text, "경조사", "상")) gapReason = "보호자 경조사";
  else if (pick(text, "출장", "부재")) gapReason = "보호자 부재(출장 등)";
  else if (pick(text, "결근", "공백")) gapReason = "돌봄 인력 결근";
  else if (pick(text, "소진", "번아웃")) gapReason = "보호자 심리적 소진";

  let estimatedGapHours = "24시간 내외";
  if (pick(text, "오전까지", "내일 오전", "익일")) estimatedGapHours = "약 12시간 이상 (야간~익일 오전)";
  else if (pick(text, "며칠", "퇴원", "72시간", "3일")) estimatedGapHours = "24–72시간";
  else if (pick(text, "몇 시간", "잠깐", "당일")) estimatedGapHours = "수 시간 (당일)";

  const dongs = (text.match(/[가-힣]+(동|읍|면)\b/g) || []).slice(0, 2);
  const gu = (text.match(/[가-힣]+구\b/g) || [])[0];
  const si = (text.match(/[가-힣]+시\b/g) || [])[0];
  const location =
    [si, gu, dongs[0]].filter(Boolean).join(" ") || req.region || "성남시 분당구";

  const currentServices: string[] = [];
  if (pick(text, "활동지원")) currentServices.push("장애인활동지원");
  if (pick(text, "주간보호", "주간활동")) currentServices.push("주간보호/주간활동");
  if (currentServices.length === 0) currentServices.push("확인 필요(이용 이력 미상)");

  const riskFactors: string[] = [];
  if (pick(text, "혼자", "단독", "없습니다", "없어")) riskFactors.push("보호자 부재·단독 체류 위험");
  if (pick(text, "야간", "밤", "21", "22", "23", "새벽")) riskFactors.push("야간 발생(담당자 부재 시간대)");
  if (pick(text, "자해", "불안")) riskFactors.push("자해·불안 등 안전 위험");
  if (pick(text, "복약", "약")) riskFactors.push("복약 누락 위험");
  if (riskFactors.length === 0) riskFactors.push("돌봄 공백에 따른 안전 위험");

  const missingQuestions = [
    "현재 대상자가 혼자 있는지, 즉시 함께 있을 수 있는 사람이 있는지",
    "오늘 밤 복약·식사·수면 등 당장 필요한 처치가 있는지",
    "기존 이용 중인 활동지원기관·담당자 연락처를 확보했는지",
    "보호자 동의(연계·정보공유) 가능 여부",
  ];

  return {
    targetType,
    disabilityFeatures,
    gapReason,
    estimatedGapHours,
    location,
    currentServices,
    riskFactors,
    missingQuestions,
  };
}

export function assessUrgency(s: StructuredIntake, sig: MatchSignals): UrgencyAssessment {
  const alone = s.riskFactors.some((r) => r.includes("단독") || r.includes("부재"));
  const safety = s.riskFactors.some((r) => r.includes("안전") || r.includes("자해"));
  let score = 40;
  if (alone) score += 22;
  if (sig.needNight) score += 16;
  if (safety) score += 14;
  if (sig.targetTags.includes("최중증")) score += 10;
  if (s.disabilityFeatures.includes("복약 관리 필요")) score += 6;
  score = Math.min(score, 98);

  let level: UrgencyAssessment["level"];
  if (alone && (sig.needNight || safety)) level = "즉시";
  else if (sig.needShortTerm) level = "당일";
  else if (score >= 55) level = "72시간";
  else level = "일반";

  const safetyFlags: string[] = [];
  if (alone) safetyFlags.push("단독 체류 — 즉시 안전 확인 필요");
  if (safety) safetyFlags.push("자해·불안 위험 — 보호 가능자 확보");
  if (s.disabilityFeatures.includes("복약 관리 필요")) safetyFlags.push("복약 시간 확인");
  if (sig.needNight) safetyFlags.push("야간 시간대 — 24시간 채널 우선");

  const rationale =
    `${s.gapReason}으로 ${s.estimatedGapHours} 공백이 예상됩니다. ` +
    (alone ? "현재 즉시 함께할 보호자가 확인되지 않아 " : "") +
    (sig.needNight ? "야간 시간대 단독 체류 위험과 " : "") +
    (safety ? "자해·불안 등 안전 위험을 고려할 때 " : "") +
    `'${level}' 수준으로 분류했습니다. 규칙 기반 안전장치가 우선 발동됩니다.`;

  return { level, score, rationale, safetyFlags };
}

function progReason(text: string): string {
  return text;
}
function instReason(distanceKm: number, grade: string | null | undefined, night: boolean, note: string | undefined, needNight: boolean): string {
  const parts = [`${distanceKm}km`];
  if (grade) parts.push(`품질 ${grade}등급`);
  parts.push(needNight ? (night ? "야간 대응 가능" : "주간 운영(야간 불가)") : night ? "야간 가능" : "주간 운영");
  const head = parts.join(" · ");
  return note ? `${head} — ${note}` : head;
}

export function buildPhases(sig: MatchSignals): RawPhase[] {
  const progById = new Map(allPrograms.map((p) => [p.id, p]));
  const prog = (id: string, reason?: string, q?: string): RawCandidate | null => {
    const p = progById.get(id);
    if (!p) return null;
    return { kind: "제도", id, matchReason: reason || progReason(p.urgentUse), confirmQuestion: q || `${p.applyVia}에 자격·신청 조건 확인` };
  };
  const instById = new Map(institutions.map((i) => [i.id, i]));
  const inst = (id: string, q?: string): RawCandidate | null => {
    const i = instById.get(id);
    if (!i) return null;
    return {
      kind: "기관",
      id,
      matchReason: instReason(i.distanceKm, i.quality?.grade, i.nightAvailable, i.note, sig.needNight),
      confirmQuestion: q || (sig.needNight && i.nightAvailable ? "오늘 밤 수용 가능 정원·대상자 특성 대응 가능 여부 확인" : "이용 가능 여부·대기·준비물 확인"),
    };
  };
  const clean = (arr: (RawCandidate | null)[]) => arr.filter((x): x is RawCandidate => x !== null);

  // 대상 유형 분기: 고령/치매 · 지체 · 발달(기본)
  const isElderly = sig.targetTags.includes("고령") || sig.targetTags.includes("치매");
  const isPhysical = !isElderly && !sig.targetTags.includes("발달장애") && sig.targetTags.includes("지체");
  const cat: "eld" | "phy" | "dev" = isElderly ? "eld" : isPhysical ? "phy" : "dev";
  const progSet: Record<"eld" | "phy" | "dev", { p1: string[]; p2: string[]; post: string[] }> = {
    dev: { p1: ["cen-03", "loc-01", "cen-01", "loc-04"], p2: ["cen-02", "cen-06", "cen-05", "loc-05"], post: ["loc-03", "cen-07"] },
    eld: { p1: ["cen-09", "loc-01", "cen-10", "cen-11"], p2: ["cen-09", "cen-11", "loc-05", "loc-07"], post: ["loc-07", "cen-10"] },
    phy: { p1: ["cen-01", "loc-04", "loc-01", "cen-04"], p2: ["cen-06", "cen-01", "loc-05"], post: ["loc-03", "cen-04"] },
  };
  const picks = progSet[cat];
  const residential = cat === "eld" ? "inst-14" : "inst-11";
  const hub = cat === "eld" ? "inst-15" : cat === "phy" ? "inst-02" : "inst-03";

  // 야간 긴급일 때 우선순위가 바뀌도록 신호 기반 선택(점수 상위)
  const nightFirstInsts = rankInstitutions(sig, { limit: 14 }).map((c) => c.institution.id);
  const topNight = nightFirstInsts.filter((id) => instById.get(id)?.nightAvailable).slice(0, 3);
  const topDay = nightFirstInsts.filter((id) => !instById.get(id)?.nightAvailable).slice(0, 3);

  const phase0: RawPhase = {
    phase: "0-2h",
    goal: "대상자 안전 확인과 즉시 보호 확보",
    aiSupport:
      "상담 내용을 표준 항목으로 구조화하고 위험요인을 추출했습니다. 담당자가 2시간 내 확인할 안전 질문을 제시합니다.",
    workerActions: [
      "대상자 현재 위치·동행자·응급 연락처 확인",
      "119·경찰·응급보호 필요성 판단(자해·불안 시)",
      "보호자 동의(연계·정보공유) 확인",
    ],
    candidates: clean([
      prog("cen-08", "야간·휴일 담당자 부재 시 1차 위기상담·긴급지원 안내 경로", "129로 즉시 연계 가능한 야간 자원 확인"),
      prog("loc-02", undefined, "성남형 24시 통합돌봄 콜로 야간 1차 연계 가능 여부 확인"),
      inst("inst-09", "사회서비스원 긴급콜로 야간 코디네이션 가능 여부 확인"),
    ]),
    confirmQuestions: [
      "지금 대상자 곁에 함께 있을 수 있는 사람이 있습니까?",
      "복약·식사 등 오늘 밤 당장 필요한 처치가 있습니까?",
      "자해·이탈 등 즉시 위험 신호가 있습니까?",
    ],
  };

  const phase1: RawPhase = {
    phase: "2-24h",
    goal: "임시 돌봄 자원 연결 (오늘 밤~익일 오전)",
    aiSupport:
      "중앙·지자체 복지서비스와 제공기관 정보를 검색해 오늘 밤 연결 가능한 후보를 압축했습니다. 야간 수용 가능 기관을 우선 정렬했습니다.",
    workerActions: [
      "기존 활동지원기관 → 인근 야간 가능 기관 순으로 전화",
      "야간 단기보호 정원 확인 후 임시 연계",
      "지역 연계 허브(지원센터·사회서비스원)와 긴급 제도 적용 협의",
    ],
    candidates: clean([
      ...picks.p1.map((id) => prog(id)),
      ...topNight.map((id) => inst(id)),
    ]),
    confirmQuestions: [
      "기존 활동지원기관에 오늘 밤 긴급 추가 투입이 가능합니까?",
      "야간 단기보호 정원이 있고 대상자 특성 대응이 가능합니까?",
      "긴급 제도 즉시 적용 절차와 소요 시간은?",
    ],
  };

  const phase2: RawPhase = {
    phase: "24-72h",
    goal: "지속 돌봄 계획 수립·전환",
    aiSupport:
      "품질평가·접근성·서비스 유형을 함께 반영해 익일 이후 지속 가능한 기관 후보의 우선순위를 정리했습니다.",
    workerActions: [
      "임시 돌봄 연장 또는 단기거주 전환 판단",
      "사례관리 등록·제도 신청 연계",
      "보호자 퇴원 시점 기준 돌봄계획 수립",
    ],
    candidates: clean([
      ...picks.p2.map((id) => prog(id)),
      ...topDay.map((id) => inst(id)),
      inst(residential),
    ]),
    confirmQuestions: [
      "지속 지원 제도(통합돌봄·장기요양 등) 대상 여부와 연계가 가능합니까?",
      "단기거주/단기보호로 며칠간 연장이 가능합니까?",
      "보호자 퇴원 예정일과 그 이후 돌봄 공백은?",
    ],
  };

  const phase3: RawPhase = {
    phase: "사후",
    goal: "재발 방지·가족지원·정책 리포트",
    aiSupport:
      "연결 성공·실패, 응답시간, 거절 사유를 비식별 통계로 축적해 공급 부족 시간대·권역 리포트를 생성합니다.",
    workerActions: [
      "연결 결과·거절 사유 기록",
      "보호자 소진 예방·가족지원 연계",
      "지자체 공급 부족 시간대·권역 검토",
    ],
    candidates: clean([
      ...picks.post.map((id) => prog(id)),
      inst("inst-09", "사회서비스원 사례관리 전환·후속 모니터링"),
      inst(hub, "지속 사례관리·후속 연계 가능 여부 확인"),
    ]),
    confirmQuestions: [
      "이번 공백의 반복 가능성과 사전 대비책은?",
      "보호자 소진 지표와 가족지원 연계가 필요합니까?",
      "이 시간대·권역에서 야간 수용 기관이 충분합니까?",
    ],
  };

  return [phase0, phase1, phase2, phase3];
}

export function buildChecklist(): string[] {
  return [
    "초기 2시간 내 안전 확인 기록 완료",
    "상위 후보 3곳 이상 전화 확인 및 결과(성공/거절/사유) 기록",
    "긴급돌봄·긴급복지 등 적용 제도 신청 여부 기록",
    "보호자 동의 및 개인정보 최소수집 원칙 준수 확인",
    "보호자 퇴원 전후 지속 돌봄계획 수립",
    "보호자 소진 예방·가족지원 연계 여부 확인",
  ];
}

export function analyzeWithFallback(req: IntakeRequest): RawAnalysis {
  const structured = extractStructured(req.text, req);
  const sig = deriveSignals(structured);
  const urgency = assessUrgency(structured, sig);
  return { structured, urgency, phases: buildPhases(sig), checklist: buildChecklist() };
}
