// ============================================================
//  공유 UI 컴포넌트 (브랜드 / 배지 / 윤리배너 / 데이터출처 / 네비)
//  server·client 양쪽에서 사용 가능 (isomorphic).
// ============================================================
import Link from "next/link";
import type { ReactNode } from "react";
import sourcesData from "@/data/sources.json";
import type { UrgencyLevel } from "@/lib/types";

/* ---------------- 아이콘 (인라인 SVG) ---------------- */
type IconProps = { className?: string };
const S = (p: IconProps, d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={p.className} aria-hidden>
    {d}
  </svg>
);
export const IconShield = (p: IconProps) => S(p, <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>);
export const IconClock = (p: IconProps) => S(p, <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>);
export const IconSpark = (p: IconProps) => S(p, <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></>);
export const IconDB = (p: IconProps) => S(p, <><ellipse cx="12" cy="5.5" rx="7" ry="2.8" /><path d="M5 5.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6M5 11.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" /></>);
export const IconBuilding = (p: IconProps) => S(p, <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>);
export const IconPhone = (p: IconProps) => S(p, <path d="M6 4h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5V18a2 2 0 01-2 2A14 14 0 014 6a2 2 0 012-2z" />);
export const IconCheck = (p: IconProps) => S(p, <path d="M5 12l4.5 4.5L19 7" />);
export const IconAlert = (p: IconProps) => S(p, <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.5v.5" /></>);
export const IconArrow = (p: IconProps) => S(p, <path d="M5 12h14M13 6l6 6-6 6" />);
export const IconRoute = (p: IconProps) => S(p, <><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8 18h6a4 4 0 004-4V8M6 16V9" /></>);
export const IconUsers = (p: IconProps) => S(p, <><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 6a3 3 0 010 6M21 19c0-2-1-3.5-3-4.3" /></>);
export const IconChart = (p: IconProps) => S(p, <><path d="M4 20V4M4 20h16" /><path d="M8 16v-3M12 16V8M16 16v-6" /></>);

/* ---------------- 브랜드 로고 ---------------- */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cb-primary text-white shadow-[0_4px_12px_rgba(14,77,140,0.35)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M3 15c2.5 0 2.5-4 6-4s3.5 4 6 4M3 15v3M21 15c-1.2 0-1.8-.9-3-2M21 15v3" />
          <circle cx="12" cy="6.5" r="2.2" />
        </svg>
      </span>
      <span className="font-extrabold tracking-tight text-cb-ink">
        케어브릿지 <span className="text-cb-primary">72</span>
      </span>
    </span>
  );
}

/* ---------------- 긴급도 배지 ---------------- */
const URGENCY_STYLE: Record<UrgencyLevel, string> = {
  "즉시": "bg-red-50 text-cb-danger ring-1 ring-red-200",
  "당일": "bg-orange-50 text-cb-warn ring-1 ring-orange-200",
  "72시간": "bg-amber-50 text-cb-amber ring-1 ring-amber-200",
  "일반": "bg-green-50 text-cb-ok ring-1 ring-green-200",
};
export function UrgencyBadge({ level, score, className = "" }: { level: UrgencyLevel; score?: number; className?: string }) {
  return (
    <span className={`cb-badge ${URGENCY_STYLE[level]} ${className}`}>
      <IconAlert className="h-3.5 w-3.5" />
      긴급도 {level}
      {typeof score === "number" && <span className="opacity-70">· {score}점</span>}
    </span>
  );
}

/* ---------------- 엔진(투명성) 배지 ---------------- */
export function EngineBadge({ engine, model, className = "" }: { engine: "claude" | "fallback"; model?: string | null; className?: string }) {
  const isClaude = engine === "claude";
  return (
    <span
      className={`cb-badge ${isClaude ? "bg-cb-accent-light text-cb-accent ring-1 ring-cb-accent/30" : "bg-slate-100 text-cb-muted ring-1 ring-slate-200"} ${className}`}
      title={isClaude ? `실시간 Claude 분석 (${model || ""})` : "데이터셋 기반 폴백 엔진"}
    >
      <IconSpark className="h-3.5 w-3.5" />
      {isClaude ? `AI 분석 · ${model || "Claude"}` : "폴백 엔진"}
    </span>
  );
}

/* ---------------- 윤리 배너 ---------------- */
export function EthicsBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border border-cb-accent/25 bg-cb-accent-light/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-cb-ink ${compact ? "" : ""}`}>
      <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-cb-accent" />
      <p>
        <b className="font-semibold">사람 중심 AI 원칙</b> · AI는 <b>추천·설명만</b> 제공하며 기관 배정·수급 결정은 담당자가 합니다(자동 배정 배제). 최소정보·동의 기반 처리, 실시간 수용 여부는 담당자 전화 확인 전제.
      </p>
    </div>
  );
}

/* ---------------- 7종 공공데이터 그리드 ---------------- */
type Src = { key: string; name: string; provider: string; format: string; use: string; records: number };
export function DataSourceGrid({ highlight = [] }: { highlight?: string[] }) {
  const sources = sourcesData as unknown as Src[];
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {sources.map((s, i) => {
        const on = highlight.length === 0 || highlight.includes(s.name);
        return (
          <div
            key={s.key}
            className={`rounded-xl border p-3.5 transition ${on ? "border-cb-primary/25 bg-white shadow-card" : "border-cb-border bg-cb-surface/60 opacity-50"}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cb-primary-light text-[11px] font-bold text-cb-primary-dark">{i + 1}</span>
              <span className="text-sm font-bold text-cb-ink">{s.name}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-cb-muted">{s.use}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="cb-chip !text-[11px]">{s.provider}</span>
              <span className="cb-chip !text-[11px]">{s.format}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- 상단 네비 ---------------- */
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-cb-border bg-white/85 backdrop-blur">
      <div className="cb-container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold text-cb-muted">
          <Link href="/" className="hidden sm:block rounded-lg px-3 py-1.5 hover:bg-cb-surface hover:text-cb-ink">소개</Link>
          <Link href="/console" className="hidden sm:block rounded-lg px-3 py-1.5 hover:bg-cb-surface hover:text-cb-ink">담당자 콘솔</Link>
          <Link href="/report" className="hidden sm:block rounded-lg px-3 py-1.5 hover:bg-cb-surface hover:text-cb-ink">사후 리포트</Link>
          <Link href="/console" className="cb-btn-primary ml-1 !px-3 !py-1.5">
            긴급 상담 시작 <IconArrow className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ---------------- 푸터 ---------------- */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-cb-border bg-white">
      <div className="cb-container py-8 text-[12.5px] leading-relaxed text-cb-muted">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <p className="mt-3 max-w-3xl">
          본 사이트는 <b>2026 국민행복 서비스 발굴·창업경진대회</b> 출품작 <b>케어브릿지 72</b>의 작동 프로토타입입니다. 화면의 기관·통계는
          한국사회보장정보원·보건복지부 공공데이터 <b>스키마를 모델링한 성남시 데모 데이터셋</b>이며, 실증 단계에서 OpenAPI·실데이터로 대체됩니다.
          AI 분석은 ANTHROPIC_API_KEY 설정 시 실시간 Claude, 미설정 시 데이터셋 기반 폴백으로 작동합니다.
        </p>
        <p className="mt-3 opacity-80">© 2026 케어브릿지 72 · 사람 중심 복지 AI 의사결정 지원</p>
      </div>
    </footer>
  );
}

/* ---------------- 작은 통계 카드 ---------------- */
export function StatCard({ value, label, sub, tone = "primary" }: { value: string; label: string; sub?: string; tone?: "primary" | "accent" | "ink" }) {
  const color = tone === "accent" ? "text-cb-accent" : tone === "ink" ? "text-cb-ink" : "text-cb-primary";
  return (
    <div className="cb-card cb-card-pad">
      <div className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</div>
      <div className="mt-1 text-sm font-semibold text-cb-ink">{label}</div>
      {sub && <div className="mt-0.5 text-[12.5px] text-cb-muted">{sub}</div>}
    </div>
  );
}
