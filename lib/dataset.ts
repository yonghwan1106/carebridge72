// ============================================================
//  공공데이터 로더 — 7종 JSON 을 읽어 결합(JOIN)한다.
//  (institutions ← quality(#4) + accessibility(#7) 결합)
// ============================================================
import institutionsRaw from "@/data/institutions.json";
import qualityRaw from "@/data/quality.json";
import accessRaw from "@/data/accessibility.json";
import centralRaw from "@/data/central-welfare.json";
import localRaw from "@/data/local-welfare.json";
import statsRaw from "@/data/activity-stats.json";
import sourcesRaw from "@/data/sources.json";
import scenarioRaw from "@/data/scenario.json";

import type {
  Institution,
  QualityRecord,
  AccessibilityRecord,
  EnrichedInstitution,
  WelfareProgram,
  ActivityStats,
  DataSource,
  ScenarioSeed,
} from "@/lib/types";

export const dataSources = sourcesRaw as unknown as DataSource[];
export const activityStats = statsRaw as unknown as ActivityStats;
export const scenario = scenarioRaw as unknown as ScenarioSeed;

export const centralPrograms = centralRaw as unknown as WelfareProgram[];
export const localPrograms = localRaw as unknown as WelfareProgram[];
export const allPrograms: WelfareProgram[] = [...centralPrograms, ...localPrograms];

const qualityList = qualityRaw as unknown as QualityRecord[];
const accessList = accessRaw as unknown as AccessibilityRecord[];
const baseInstitutions = institutionsRaw as unknown as Institution[];

const qualityById = new Map(qualityList.map((q) => [q.institutionId, q]));
const accessById = new Map(accessList.map((a) => [a.institutionId, a]));

export const institutions: EnrichedInstitution[] = baseInstitutions.map((i) => ({
  ...i,
  quality: qualityById.get(i.id) ?? null,
  accessibility: accessById.get(i.id) ?? null,
}));

export const institutionById = new Map(institutions.map((i) => [i.id, i]));
export const programById = new Map(allPrograms.map((p) => [p.id, p]));

export function getInstitution(id: string): EnrichedInstitution | undefined {
  return institutionById.get(id);
}
export function getProgram(id: string): WelfareProgram | undefined {
  return programById.get(id);
}

/** 데이터셋명 → 메타정보 (UI 배지/근거 표기에 사용) */
export const sourceByName = new Map(dataSources.map((s) => [s.name, s]));
