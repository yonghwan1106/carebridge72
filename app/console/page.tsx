"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import scenario from "@/data/scenario.json";
import {
  EthicsBanner,
  UrgencyBadge,
  EngineBadge,
  IconArrow,
  IconSpark,
  IconCheck,
  IconPhone,
  IconBuilding,
  IconDB,
  IconAlert,
  IconClock,
  IconRoute,
  IconUsers,
  IconChart,
} from "@/components/ui";
import type {
  AnalysisResult,
  InstitutionCandidate,
  PhasePlan,
  ProgramCandidate,
} from "@/lib/types";

type Stage = "intake" | "analyzing" | "result";
type RecStatus = "미확인" | "전화 시도" | "연계 성공" | "거절" | "대기";
const STATUS_LIST: RecStatus[] = ["미확인", "전화 시도", "연계 성공", "거절", "대기"];
const STATUS_STYLE: Record<RecStatus, string> = {
  "미확인": "bg-slate-100 text-cb-muted",
  "전화 시도": "bg-blue-50 text-cb-primary",
  "연계 성공": "bg-green-50 text-cb-ok",
  "거절": "bg-red-50 text-cb-danger",
  "대기": "bg-amber-50 text-cb-amber",
};

const ANALYZING_STEPS = [
  "상담 내용을 표준 항목으로 구조화 중…",
  "대상자 특성·장애 유형 분류 중…",
  "긴급도·안전요인 판정 중…",
  "공공데이터(제도·제공기관 DB) 조회 중…",
  "품질·거리·야간 가용성 점수 산정 중…",
  "기관 우선순위 압축 중…",
  "72시간 단계별 대응안 생성 중…",
  "확인 질문·처리 체크리스트 정리 중…",
];

const PHASE_TONE: Record<string, { dot: string; chip: string }> = {
  "0-2h": { dot: "bg-cb-danger", chip: "bg-red-50 text-cb-danger" },
  "2-24h": { dot: "bg-cb-warn", chip: "bg-orange-50 text-cb-warn" },
  "24-72h": { dot: "bg-cb-amber", chip: "bg-amber-50 text-cb-amber" },
  "사후": { dot: "bg-cb-ok", chip: "bg-green-50 text-cb-ok" },
};

export default function ConsolePage() {
  const [stage, setStage] = useState<Stage>("intake");
  const [text, setText] = useState(scenario.inputText);
  const [region, setRegion] = useState(scenario.region);
  const [occurredAt, setOccurredAt] = useState(scenario.occurredAt);
  const [consent, setConsent] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [records, setRecords] = useState<Record<string, { status: RecStatus; note: string }>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const resultRef = useRef<HTMLDivElement>(null);

  // 분석 중 단계 애니메이션 + 경과 시간
  useEffect(() => {
    if (stage !== "analyzing") return;
    setStepIdx(0);
    setElapsed(0);
    const t1 = setInterval(() => setStepIdx((i) => (i + 1) % ANALYZING_STEPS.length), 1400);
    const t2 = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [stage]);

  // 처리기록 localStorage 영속(데모 현실감)
  useEffect(() => {
    if (!result) return;
    try {
      const saved = localStorage.getItem("cb72-rec-" + result.caseId);
      if (saved) setRecords(JSON.parse(saved));
    } catch {}
  }, [result]);
  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem("cb72-rec-" + result.caseId, JSON.stringify(records));
    } catch {}
  }, [records, result]);

  async function analyze() {
    setErr(null);
    setStage("analyzing");
    const started = Date.now();
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, region, occurredAt, consent }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "분석에 실패했습니다.");
      }
      const data: AnalysisResult = await res.json();
      // 최소 연출 시간 보장(애니메이션이 끊겨 보이지 않도록)
      const wait = Math.max(0, 1600 - (Date.now() - started));
      setTimeout(() => {
        setResult(data);
        setRecords({});
        setStage("result");
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }, wait);
    } catch (e) {
      setErr((e as Error).message);
      setStage("intake");
    }
  }

  function reset() {
    setResult(null);
    setRecords({});
    setStage("intake");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="cb-container py-8">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="cb-eyebrow">담당자 콘솔</span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-cb-ink">긴급 돌봄공백 대응</h1>
        </div>
        {stage === "result" && result && (
          <div className="flex items-center gap-2">
            <EngineBadge engine={result.engine} model={result.model} />
            <button onClick={reset} className="cb-btn-ghost !py-2">새 분석</button>
          </div>
        )}
      </div>

      {/* 접수 폼 */}
      {stage !== "result" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="cb-card cb-card-pad">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cb-primary text-sm font-bold text-white">①</span>
              <h2 className="text-base font-bold text-cb-ink">돌봄 공백 상황 접수</h2>
            </div>
            <label className="cb-label">상황 설명 (보호자 통화 메모를 그대로 붙여넣어도 됩니다)</label>
            <textarea
              className="cb-input min-h-[180px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예) 오늘 밤 보호자가 응급입원했고 당장 돌볼 가족이 없습니다…"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="cb-label">거주지(시군구)</label>
                <input className="cb-input" value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>
              <div>
                <label className="cb-label">발생 시각</label>
                <input className="cb-input" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
              </div>
            </div>
            <label className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-cb-muted">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-cb-primary" />
              보호자 동의 하에 최소정보만 입력하며, 민감정보는 기관 내부 범위로 처리함을 확인합니다.
            </label>

            {err && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-cb-danger">
                <IconAlert className="h-4 w-4" /> {err}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button onClick={analyze} disabled={stage === "analyzing" || text.trim().length < 5} className="cb-btn-primary !px-5 !py-3">
                {stage === "analyzing" ? "분석 중…" : (<><IconSpark className="h-4 w-4" /> AI 72시간 대응안 생성</>)}
              </button>
              <button onClick={() => { setText(scenario.inputText); setRegion(scenario.region); setOccurredAt(scenario.occurredAt); }} className="cb-btn-ghost !py-3">
                기본 시나리오 불러오기
              </button>
            </div>
          </div>

          {/* 사이드: 안내 */}
          <div className="space-y-4">
            <div className="cb-card cb-card-pad">
              <div className="flex items-center gap-2 text-sm font-bold text-cb-ink">
                <IconClock className="h-4 w-4 text-cb-primary" /> 기본 탑재 시나리오
              </div>
              <p className="mt-2 text-[13px] font-semibold text-cb-ink">{scenario.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-cb-muted">
                사업계획서의 대표 사례를 그대로 시연할 수 있도록 기본 입력되어 있습니다. 그대로 실행하거나 자유롭게 수정하세요.
              </p>
            </div>
            <div className="cb-card cb-card-pad">
              <div className="flex items-center gap-2 text-sm font-bold text-cb-ink">
                <IconDB className="h-4 w-4 text-cb-primary" /> 분석에 쓰는 데이터
              </div>
              <ul className="mt-2 space-y-1 text-[12.5px] text-cb-muted">
                <li>· 중앙·지자체 복지서비스 (제도 후보)</li>
                <li>· 사회서비스 제공기관·사회복지시설 (기관 후보)</li>
                <li>· 품질평가·장애인편의시설 (우선순위·접근성)</li>
                <li>· 장애인활동지원 통계 (공급 수준)</li>
              </ul>
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11.5px] leading-snug text-cb-amber">
                <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>기관 후보는 <b>성남시 데모 데이터셋</b> 기준입니다. 실증 시 해당 지자체 OpenAPI 실데이터로 대체됩니다.</span>
              </div>
            </div>
            <EthicsBanner />
          </div>
        </div>
      )}

      {/* 분석 중 오버레이 */}
      {stage === "analyzing" && (
        <div className="mt-6 cb-card cb-card-pad">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cb-accent/30 animate-pulse-ring" />
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-cb-accent text-white">
                <IconSpark className="h-5 w-5" />
              </span>
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-cb-ink">AI가 72시간 대응안을 생성하고 있습니다</div>
                <span className="text-[11px] font-semibold tabular-nums text-cb-muted">{elapsed}초</span>
              </div>
              <div key={stepIdx} className="mt-0.5 text-[13px] text-cb-muted animate-fade-up">{ANALYZING_STEPS[stepIdx]}</div>
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cb-surface">
            <div className="h-full rounded-full bg-cb-accent" style={{ width: `${((stepIdx + 1) / ANALYZING_STEPS.length) * 100}%`, transition: "width .6s" }} />
          </div>
          <div className="mt-2 text-[11px] leading-relaxed text-cb-muted">실시간 AI 분석은 보통 10~15초 소요됩니다(최대 25초). 지연 시 데이터셋 기반 규칙 엔진으로 자동 전환됩니다.</div>
        </div>
      )}

      {/* 결과 */}
      {stage === "result" && result && (
        <ResultView result={result} records={records} setRecords={setRecords} resultRef={resultRef} />
      )}
    </div>
  );
}

/* =================== 결과 뷰 =================== */
function ResultView({
  result,
  records,
  setRecords,
  resultRef,
}: {
  result: AnalysisResult;
  records: Record<string, { status: RecStatus; note: string }>;
  setRecords: React.Dispatch<React.SetStateAction<Record<string, { status: RecStatus; note: string }>>>;
  resultRef: React.RefObject<HTMLDivElement>;
}) {
  const summary = useMemo(() => {
    const c: Record<RecStatus, number> = { "미확인": 0, "전화 시도": 0, "연계 성공": 0, "거절": 0, "대기": 0 };
    Object.values(records).forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [records]);

  function setStatus(id: string, status: RecStatus) {
    setRecords((prev) => ({ ...prev, [id]: { status, note: prev[id]?.note || "" } }));
  }
  function setNote(id: string, note: string) {
    setRecords((prev) => ({ ...prev, [id]: { status: prev[id]?.status || "미확인", note } }));
  }

  return (
    <div ref={resultRef} className="mt-6 space-y-6 scroll-mt-20">
      {/* 케이스 헤더 */}
      <div className="cb-card cb-card-pad">
        <div className="flex flex-wrap items-center gap-3">
          <UrgencyBadge level={result.urgency.level} score={result.urgency.score} />
          <span className="cb-chip"><IconClock className="h-3.5 w-3.5" /> {result.region} · {result.receivedAt}</span>
          <span className="cb-chip">케이스 {result.caseId}</span>
          <span className="cb-chip">처리 {(result.elapsedMs / 1000).toFixed(1)}s</span>
          <span className="ml-auto"><EngineBadge engine={result.engine} model={result.model} /></span>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-cb-ink">{result.urgency.rationale}</p>
        {result.regionMismatch && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-cb-amber">
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>현재 데모 데이터셋은 <b>성남시</b> 기관만 탑재되어 있습니다. 입력하신 <b>{result.region}</b>의 실제 기관·제도는 실증 단계에서 해당 지자체 OpenAPI 실데이터로 자동 표출됩니다. 아래는 매칭 엔진의 동작을 보여주는 <b>성남시 예시</b>입니다.</span>
          </div>
        )}
        {result.lowConfidence && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-cb-primary/20 bg-cb-primary-light/60 px-3 py-2.5 text-[12.5px] leading-relaxed text-cb-primary-dark">
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>입력 정보가 부족합니다. 정확한 대응을 위해 먼저 아래 <b>‘담당자 추가 확인 질문’</b>을 보완해 주세요. 현재 결과는 제한된 정보 기준의 잠정 분석입니다.</span>
          </div>
        )}
        {result.urgency.safetyFlags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {result.urgency.safetyFlags.map((f) => (
              <span key={f} className="cb-badge bg-red-50 text-cb-danger ring-1 ring-red-200"><IconAlert className="h-3.5 w-3.5" /> {f}</span>
            ))}
          </div>
        )}
        {/* 사용 데이터 출처 */}
        <div className="mt-4 border-t border-cb-border pt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-muted">
            <IconDB className="h-3.5 w-3.5" /> 이번 분석에 활용된 공공데이터
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-cb-amber">성남시 데모셋 기준</span>
            {result.usedDataSources.map((s) => (
              <span key={s} className="cb-source-tag">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ② 상담 구조화 */}
      <Section step="②" title="AI 상담 구조화" icon={IconUsers}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="대상자 유형" value={result.structured.targetType} strong />
          <Field label="보호자 공백 사유" value={result.structured.gapReason} strong />
          <Field label="공백 예상 시간" value={result.structured.estimatedGapHours} />
          <Field label="위치" value={result.structured.location} />
          <ChipField label="장애·돌봄 특성" items={result.structured.disabilityFeatures} />
          <ChipField label="기존 이용 서비스" items={result.structured.currentServices} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5">
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-danger">긴급 위험요인</div>
            <ul className="space-y-1 text-[13px] text-cb-ink">
              {result.structured.riskFactors.map((r) => <li key={r} className="flex gap-1.5"><IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cb-danger" />{r}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-cb-accent/20 bg-cb-accent-light/40 p-3.5">
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-accent">담당자 추가 확인 질문</div>
            <ul className="space-y-1 text-[13px] text-cb-ink">
              {result.structured.missingQuestions.map((q) => <li key={q} className="flex gap-1.5"><IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cb-accent" />{q}</li>)}
            </ul>
          </div>
        </div>
      </Section>

      {/* ④ 72시간 대응안 */}
      <Section step="③·④" title="72시간 대응안" icon={IconRoute}>
        <div className="space-y-5">
          {result.phases.map((p) => (
            <PhaseBlock key={p.phase} phase={p} records={records} onStatus={setStatus} onNote={setNote} />
          ))}
        </div>
      </Section>

      {/* ⑤ 처리 기록 요약 + 체크리스트 */}
      <Section step="⑤" title="처리 기록 · 사후관리" icon={IconCheck}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-cb-border bg-cb-surface/60 p-4">
            <div className="text-sm font-bold text-cb-ink">연계 처리 현황</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STATUS_LIST.filter((s) => s !== "미확인").map((s) => (
                <div key={s} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-cb-border">
                  <span className={`cb-badge ${STATUS_STYLE[s]}`}>{s}</span>
                  <span className="text-lg font-extrabold text-cb-ink">{summary[s] || 0}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-cb-muted">
              각 기관 카드에서 전화 확인 결과를 기록하면 비식별 통계로 축적되어 <Link href="/report" className="font-semibold text-cb-primary underline">사후 리포트</Link>의 공급부족 분석에 반영됩니다.
            </p>
          </div>
          <div className="rounded-xl border border-cb-border bg-white p-4">
            <div className="text-sm font-bold text-cb-ink">사후관리 체크리스트</div>
            <ul className="mt-2.5 space-y-1.5 text-[13px] text-cb-ink">
              {result.checklist.map((c) => (
                <li key={c} className="flex gap-2"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-cb-ok" />{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 윤리 + 다음 */}
      <div className="cb-card cb-card-pad">
        <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-cb-muted">서비스 원칙</div>
        <ul className="space-y-1.5 text-[13px] text-cb-ink">
          {result.ethics.map((e) => <li key={e} className="flex gap-2"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-cb-accent" />{e}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/report" className="cb-btn-primary"><IconChart className="h-4 w-4" /> 사후 리포트(지자체 정책자료) 보기</Link>
        </div>
      </div>
    </div>
  );
}

/* =================== 하위 컴포넌트 =================== */
function Section({ step, title, icon: Icon, children }: { step: string; title: string; icon: (p: { className?: string }) => JSX.Element; children: React.ReactNode }) {
  return (
    <section className="cb-card cb-card-pad">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-cb-primary px-2 text-sm font-bold text-white">{step}</span>
        <Icon className="h-5 w-5 text-cb-primary" />
        <h2 className="text-base font-bold text-cb-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-cb-border bg-cb-surface/50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-cb-muted">{label}</div>
      <div className={`mt-0.5 text-[14px] ${strong ? "font-bold text-cb-ink" : "text-cb-ink"}`}>{value}</div>
    </div>
  );
}

function ChipField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-cb-border bg-cb-surface/50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-cb-muted">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((i) => <span key={i} className="cb-chip !bg-white">{i}</span>)}
      </div>
    </div>
  );
}

function PhaseBlock({
  phase,
  records,
  onStatus,
  onNote,
}: {
  phase: PhasePlan;
  records: Record<string, { status: RecStatus; note: string }>;
  onStatus: (id: string, s: RecStatus) => void;
  onNote: (id: string, n: string) => void;
}) {
  const tone = PHASE_TONE[phase.phase] || PHASE_TONE["사후"];
  return (
    <div className="relative rounded-xl border border-cb-border bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
        <span className={`cb-badge ${tone.chip}`}>{phase.window}</span>
        <span className="text-sm font-bold text-cb-ink">{phase.goal}</span>
      </div>

      {/* AI 지원 설명 */}
      <div className="mt-2.5 flex gap-2 rounded-lg bg-cb-accent-light/40 px-3 py-2 text-[13px] leading-relaxed text-cb-ink">
        <IconSpark className="mt-0.5 h-4 w-4 shrink-0 text-cb-accent" />
        <span>{phase.aiSupport}</span>
      </div>

      {/* 제도 후보 */}
      {phase.programs.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-muted">적용 가능 제도 후보</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {phase.programs.map((c) => <ProgramCard key={c.program.id} c={c} />)}
          </div>
        </div>
      )}

      {/* 기관 후보 */}
      {phase.institutions.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-muted">연결 후보 기관 (전화 확인 대상)</div>
          <div className="space-y-2">
            {phase.institutions.map((c) => (
              <InstitutionCard key={c.institution.id} c={c} rec={records[c.institution.id]} onStatus={onStatus} onNote={onNote} />
            ))}
          </div>
        </div>
      )}

      {/* 담당자 확인 질문 */}
      {phase.confirmQuestions.length > 0 && (
        <div className="mt-3 rounded-lg border border-cb-border bg-cb-surface/50 p-3">
          <div className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-cb-muted">담당자 확인 질문</div>
          <ul className="space-y-1 text-[13px] text-cb-ink">
            {phase.confirmQuestions.map((q) => <li key={q} className="flex gap-1.5"><IconPhone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cb-primary" />{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ c }: { c: ProgramCandidate }) {
  return (
    <div className="rounded-lg border border-cb-border bg-cb-surface/40 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[13.5px] font-bold text-cb-ink">{c.program.name}</span>
        <span className="cb-chip !text-[10.5px]">{c.program.level}·{c.program.org}</span>
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-cb-muted">{c.matchReason}</p>
      <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-cb-primary-dark">
        <IconPhone className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.confirmQuestion}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {c.dataBasis.map((b) => <span key={b} className="cb-source-tag !text-[10px]">{b}</span>)}
      </div>
    </div>
  );
}

function InstitutionCard({
  c,
  rec,
  onStatus,
  onNote,
}: {
  c: InstitutionCandidate;
  rec?: { status: RecStatus; note: string };
  onStatus: (id: string, s: RecStatus) => void;
  onNote: (id: string, n: string) => void;
}) {
  const i = c.institution;
  const status = rec?.status || "미확인";
  return (
    <div className="rounded-lg border border-cb-border bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <IconBuilding className="h-4 w-4 text-cb-primary" />
            <span className="text-[14px] font-bold text-cb-ink">{i.name}</span>
            <span className="cb-chip !text-[10.5px]">{i.type}</span>
            {i.nightAvailable && <span className="cb-badge !text-[10.5px] bg-cb-primary-light text-cb-primary-dark">야간 가능</span>}
            {i.quality && <span className="cb-badge !text-[10.5px] bg-slate-100 text-cb-muted">품질 {i.quality.grade}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-cb-muted">
            <span>{i.sigungu} {i.dong} · {i.distanceKm}km</span>
            <span className="inline-flex items-center gap-1"><IconClock className="h-3 w-3" />{i.hours}</span>
            <span className="inline-flex items-center gap-1"><IconPhone className="h-3 w-3" />{i.phone}</span>
          </div>
        </div>
        {/* 매칭 점수 */}
        <div className="text-right">
          <div className="text-[11px] font-semibold text-cb-muted">매칭 점수</div>
          <div className="text-lg font-extrabold leading-none text-cb-primary">{c.score}</div>
        </div>
      </div>

      <p className="mt-2 text-[12.5px] leading-relaxed text-cb-ink">{c.matchReason}</p>

      {/* 점수 분해 바 */}
      <div className="mt-2 flex items-center gap-2">
        <ScoreBar breakdown={c.breakdown} />
      </div>

      <div className="mt-2 flex items-start gap-1.5 text-[12px] text-cb-primary-dark">
        <IconPhone className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.confirmQuestion}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {c.dataBasis.map((b) => <span key={b} className="cb-source-tag !text-[10px]">{b}</span>)}
        {i.accessibility && <span className="cb-chip !text-[10px]">접근성 {i.accessibility.level}</span>}
      </div>

      {/* 처리 기록 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-cb-border pt-2.5">
        {STATUS_LIST.map((s) => (
          <button
            key={s}
            onClick={() => onStatus(i.id, s)}
            className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition ${status === s ? STATUS_STYLE[s] + " ring-1 ring-current/30" : "bg-cb-surface text-cb-muted hover:bg-slate-100"}`}
          >
            {s}
          </button>
        ))}
        <input
          value={rec?.note || ""}
          onChange={(e) => onNote(i.id, e.target.value)}
          placeholder="확인 메모(거절 사유·가능 시간 등)"
          className="ml-1 min-w-[160px] flex-1 rounded-lg border border-cb-border bg-white px-2.5 py-1 text-[12px] focus:border-cb-primary focus:outline-none"
        />
      </div>
    </div>
  );
}

function ScoreBar({ breakdown }: { breakdown: InstitutionCandidate["breakdown"] }) {
  const parts = [
    { k: "적합", v: breakdown.fit, max: 40, c: "bg-cb-primary" },
    { k: "야간", v: breakdown.night, max: 20, c: "bg-cb-accent" },
    { k: "거리", v: breakdown.distance, max: 20, c: "bg-sky-400" },
    { k: "품질", v: breakdown.quality, max: 15, c: "bg-violet-400" },
    { k: "접근", v: breakdown.access, max: 5, c: "bg-emerald-400" },
  ];
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-cb-surface">
        {parts.map((p) => (
          <div key={p.k} className={p.c} style={{ width: `${p.v}%` }} title={`${p.k} ${p.v}/${p.max}`} />
        ))}
      </div>
      <div className="hidden gap-2 text-[10.5px] text-cb-muted sm:flex">
        {parts.map((p) => <span key={p.k}>{p.k} {p.v}</span>)}
      </div>
    </div>
  );
}
