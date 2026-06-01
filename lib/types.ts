// ============================================================
//  케어브릿지 72 - 공통 타입 (JSON 데이터 ↔ 분석 결과 계약)
// ============================================================

// ---------- 공공데이터 원천 타입 ----------
export interface Institution {
  id: string;
  name: string;
  type: string;
  sourceDataset: string; // 출처 공공데이터셋명 (#3 제공기관정보 / #6 사회복지시설)
  sigungu: string;
  dong: string;
  address: string;
  distanceKm: number;
  phone: string;
  hours: string;
  nightAvailable: boolean;
  serviceTypes: string[];
  targetTags: string[];
  note?: string;
}

export interface QualityRecord {
  institutionId: string;
  grade: "A" | "B" | "C" | "D";
  year: number;
  score: number;
}

export interface AccessibilityRecord {
  institutionId: string;
  level: "우수" | "양호" | "보통";
  features: string[];
}

export interface EnrichedInstitution extends Institution {
  quality: QualityRecord | null;
  accessibility: AccessibilityRecord | null;
}

export interface WelfareProgram {
  id: string;
  name: string;
  level: "중앙" | "지자체";
  org: string;
  category: string;
  target: string;
  summary: string;
  urgentUse: string;
  applyVia: string;
  tags: string[];
}

export interface ActivityStats {
  region: string;
  sido: string;
  year: number;
  recipients: number;
  providerCount: number;
  workers: number;
  sidoRecipients: number;
  sidoProviderCount: number;
  developmentalShare: number;
  nightCapableProviderShare: number;
  note: string;
}

export interface DataSource {
  key: string;
  name: string;
  provider: string;
  format: string;
  use: string;
  records: number;
}

export interface ScenarioSeed {
  id: string;
  title: string;
  region: string;
  homeDong: string;
  occurredAt: string;
  inputText: string;
  guideExamples: string[];
}

// ---------- 분석 입력 ----------
export interface IntakeRequest {
  text: string;
  region?: string;
  occurredAt?: string;
  consent: boolean;
}

// ---------- 분석 결과 계약 ----------
export type UrgencyLevel = "즉시" | "당일" | "72시간" | "일반";
export type PhaseKey = "0-2h" | "2-24h" | "24-72h" | "사후";

export interface StructuredIntake {
  targetType: string;
  disabilityFeatures: string[];
  gapReason: string;
  estimatedGapHours: string;
  location: string;
  currentServices: string[];
  riskFactors: string[];
  missingQuestions: string[];
}

export interface UrgencyAssessment {
  level: UrgencyLevel;
  score: number; // 0-100
  rationale: string;
  safetyFlags: string[];
}

// 엔진(Claude/폴백)이 산출하는 원시 후보 (id 기반)
export interface RawCandidate {
  kind: "제도" | "기관";
  id: string;
  matchReason: string;
  confirmQuestion: string;
}

export interface RawPhase {
  phase: PhaseKey;
  goal: string;
  aiSupport: string;
  workerActions: string[];
  candidates: RawCandidate[];
  confirmQuestions: string[];
}

export interface RawAnalysis {
  structured: StructuredIntake;
  urgency: UrgencyAssessment;
  phases: RawPhase[];
  checklist: string[];
}

// 하이드레이트된 후보 (UI 렌더용)
export interface ScoreBreakdown {
  fit: number;
  night: number;
  distance: number;
  quality: number;
  access: number;
}

export interface ProgramCandidate {
  kind: "제도";
  program: WelfareProgram;
  matchReason: string;
  confirmQuestion: string;
  dataBasis: string[];
}

export interface InstitutionCandidate {
  kind: "기관";
  institution: EnrichedInstitution;
  matchReason: string;
  confirmQuestion: string;
  dataBasis: string[];
  score: number; // 0-100 매칭 점수 (결정론적)
  breakdown: ScoreBreakdown;
}

export interface PhasePlan {
  phase: PhaseKey;
  window: string;
  goal: string;
  aiSupport: string;
  workerActions: string[];
  programs: ProgramCandidate[];
  institutions: InstitutionCandidate[];
  confirmQuestions: string[];
}

export interface AnalysisResult {
  caseId: string;
  region: string;
  receivedAt: string;
  structured: StructuredIntake;
  urgency: UrgencyAssessment;
  phases: PhasePlan[];
  checklist: string[];
  usedDataSources: string[];
  ethics: string[];
  regionMismatch: boolean;
  lowConfidence: boolean;
  engine: "claude" | "fallback";
  model: string | null;
  elapsedMs: number;
}
