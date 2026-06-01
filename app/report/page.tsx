import Link from "next/link";
import {
  StatCard,
  IconChart,
  IconClock,
  IconAlert,
  IconArrow,
  IconDB,
  IconShield,
} from "@/components/ui";

export const metadata = { title: "사후 리포트 · 케어브릿지 72" };

const TIME_DIST = [
  { label: "06–09", v: 6 },
  { label: "09–12", v: 8 },
  { label: "12–18", v: 12 },
  { label: "18–21", v: 18 },
  { label: "21–24", v: 27 },
  { label: "00–06", v: 21 },
];
const SHORTAGE = [
  { label: "수정구", v: 38 },
  { label: "중원구", v: 29 },
  { label: "분당구", v: 14 },
];
const REJECT = [
  { label: "정원 초과", v: 34 },
  { label: "야간 인력 부족", v: 28 },
  { label: "도전행동 대응 곤란", v: 19 },
  { label: "거리·이동", v: 11 },
  { label: "기타", v: 8 },
];
const TARGET = [
  { label: "최중증 발달장애", v: 42 },
  { label: "치매·고령", v: 22 },
  { label: "중증 지체", v: 18 },
  { label: "기타", v: 18 },
];

function Bars({ data, unit = "", color = "bg-cb-primary" }: { data: { label: string; v: number }[]; unit?: string; color?: string }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-right text-[12.5px] font-medium text-cb-muted">{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-cb-surface">
            <div className={`h-full rounded-md ${color}`} style={{ width: `${(d.v / max) * 100}%` }} />
          </div>
          <span className="w-12 shrink-0 text-[12.5px] font-bold text-cb-ink">{d.v}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="cb-container py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="cb-eyebrow">사후 리포트 · 지자체 정책자료</span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-cb-ink">돌봄공백 대응 리포트</h1>
          <p className="mt-1 text-sm text-cb-muted">처리 결과를 비식별·집계 통계로 축적해 공급 부족 시간대·권역을 분석합니다.</p>
        </div>
        <Link href="/console" className="cb-btn-ghost"><IconArrow className="h-4 w-4" /> 콘솔로 돌아가기</Link>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-cb-amber">
        <IconShield className="h-4 w-4" /> 아래 수치는 6개월 실증을 가정한 <b className="mx-1">데모 집계</b>입니다. 개인식별 정보 없이 시간대·권역·사유만 집계합니다.
      </div>

      {/* KPI */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value="184건" label="긴급 상담 처리 누계" sub="목표 200건의 92%" />
        <StatCard value="17분" label="평균 초기 정리·탐색" sub="기준 40분 → 목표 15분" tone="accent" />
        <StatCard value="63%" label="상위 3후보 연계가능 포함률" sub="목표 60% 달성" />
        <StatCard value="91%" label="2시간 내 안전확인 기록" sub="목표 90% 달성" tone="ink" />
      </div>

      {/* 차트 그리드 */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="cb-card cb-card-pad">
          <div className="flex items-center gap-2"><IconClock className="h-5 w-5 text-cb-primary" /><h2 className="text-base font-bold text-cb-ink">시간대별 돌봄공백 발생</h2></div>
          <p className="mt-1 text-[12.5px] text-cb-muted">21시–익일 06시 야간대에 공백이 집중 — 담당자 부재 시간대.</p>
          <div className="mt-4"><Bars data={TIME_DIST} unit="건" /></div>
        </div>

        <div className="cb-card cb-card-pad">
          <div className="flex items-center gap-2"><IconAlert className="h-5 w-5 text-cb-danger" /><h2 className="text-base font-bold text-cb-ink">권역별 야간 미연계율</h2></div>
          <p className="mt-1 text-[12.5px] text-cb-muted">수정구·중원구의 야간 수용 기관 부족 — 공급 보강 우선 권역.</p>
          <div className="mt-4"><Bars data={SHORTAGE} unit="%" color="bg-cb-danger" /></div>
        </div>

        <div className="cb-card cb-card-pad">
          <div className="flex items-center gap-2"><IconChart className="h-5 w-5 text-cb-warn" /><h2 className="text-base font-bold text-cb-ink">연계 거절 사유 분포</h2></div>
          <p className="mt-1 text-[12.5px] text-cb-muted">정원 초과·야간 인력 부족이 핵심 병목 — 정책·예산 근거.</p>
          <div className="mt-4"><Bars data={REJECT} unit="%" color="bg-cb-warn" /></div>
        </div>

        <div className="cb-card cb-card-pad">
          <div className="flex items-center gap-2"><IconDB className="h-5 w-5 text-cb-accent" /><h2 className="text-base font-bold text-cb-ink">대상자 유형 분포</h2></div>
          <p className="mt-1 text-[12.5px] text-cb-muted">최중증 발달장애가 최다 — 1차 타깃 집중의 타당성.</p>
          <div className="mt-4"><Bars data={TARGET} unit="%" color="bg-cb-accent" /></div>
        </div>
      </div>

      {/* 정책 시사점 */}
      <div className="mt-6 cb-card cb-card-pad">
        <h2 className="text-base font-bold text-cb-ink">정책 시사점 (자동 도출)</h2>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-cb-ink">
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cb-primary" /> 야간(21–06시) 단기보호·긴급활동지원 <b>공급 확충</b>이 가장 시급하며, 수정구·중원구 우선 보강이 필요합니다.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cb-primary" /> 거절 사유 1·2위가 <b>정원·야간 인력</b>인 점은 기관 인센티브·야간 수가 보강의 근거가 됩니다.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cb-primary" /> 최중증 발달장애 비중이 높아 <b>긴급돌봄 시범사업·통합돌봄</b> 연계 절차 간소화 효과가 큽니다.</li>
        </ul>
      </div>
    </div>
  );
}
