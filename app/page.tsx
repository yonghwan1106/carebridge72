import Link from "next/link";
import { Figure } from "@/components/Figure";
import {
  DataSourceGrid,
  EthicsBanner,
  StatCard,
  IconArrow,
  IconClock,
  IconSpark,
  IconDB,
  IconRoute,
  IconCheck,
  IconChart,
  IconShield,
  IconUsers,
} from "@/components/ui";

const STEPS = [
  { n: "①", t: "상황 접수", d: "담당자가 보호자 공백 상황을 자연어로 입력", icon: IconUsers },
  { n: "②", t: "AI 상담 구조화", d: "대상자·공백사유·예상시간·위험요인 추출 + 누락질문 생성", icon: IconSpark },
  { n: "③", t: "긴급도 분류", d: "규칙 기반 안전장치 + AI로 즉시/당일/72h/일반 판정", icon: IconAlertInline },
  { n: "④", t: "72시간 대응안", d: "0–2h·2–24h·24–72h 단계별 제도·기관 후보와 확인질문", icon: IconRoute },
  { n: "⑤", t: "처리 기록", d: "전화 확인 결과(연계/거절/대기)를 구조화해 축적", icon: IconCheck },
  { n: "⑥", t: "사후 리포트", d: "공급 부족 시간대·권역, KPI를 지자체 정책자료로", icon: IconChart },
];

function IconAlertInline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.5v.5" />
    </svg>
  );
}

const PROTOCOL = [
  { w: "0–2h", g: "즉시 안전 확인", c: "text-cb-danger", bg: "bg-red-50", dot: "bg-cb-danger" },
  { w: "2–24h", g: "임시 돌봄 연결", c: "text-cb-warn", bg: "bg-orange-50", dot: "bg-cb-warn" },
  { w: "24–72h", g: "지속 지원 전환", c: "text-cb-amber", bg: "bg-amber-50", dot: "bg-cb-amber" },
  { w: "사후", g: "재발 방지·리포트", c: "text-cb-ok", bg: "bg-green-50", dot: "bg-cb-ok" },
];

const DIFF = [
  { name: "복지로 · 복지멤버십", role: "받을 수 있는 제도 안내", limit: "긴급 연결 순서·기관 확인 절차 제한적" },
  { name: "복지위기 알림 앱", role: "위기 신고·제보 채널", limit: "신고 이후 담당자의 연결 업무는 별도" },
  { name: "일반 AI 복지 챗봇", role: "질의응답·정보 설명", limit: "현장 기관 확인·처리결과 축적이 약함" },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-cb-border bg-white">
        <div className="absolute inset-0 cb-grid-faint opacity-70" />
        <div className="cb-container relative py-14 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
            <div>
              <span className="cb-eyebrow">2026 국민행복 서비스 발굴·창업경진대회 · 작동 프로토타입</span>
              <h1 className="mt-3 text-[34px] font-extrabold leading-[1.18] tracking-tight text-cb-ink sm:text-[42px]">
                보호자가 쓰러진 그 밤,
                <br />
                돌봄 공백을 <span className="text-cb-primary">72시간</span> 안에 잇습니다
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cb-muted">
                최중증 발달장애인 보호자의 입원·경조사·소진으로 돌봄이 끊긴 순간, <b className="text-cb-ink">케어브릿지 72</b>는 7종 공공데이터와 AI로
                지자체 담당자에게 <b className="text-cb-ink">0–2h·2–24h·24–72h 실행 대응안</b>을 생성합니다. 정보 안내가 아니라 <b className="text-cb-ink">실행안 생성</b>입니다.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/console" className="cb-btn-primary !px-5 !py-3 text-[15px]">
                  긴급 상담 콘솔 열기 <IconArrow className="h-4 w-4" />
                </Link>
                <Link href="/report" className="cb-btn-ghost !px-5 !py-3 text-[15px]">
                  <IconChart className="h-4 w-4" /> 사후 리포트 보기
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-cb-muted">
                <span className="inline-flex items-center gap-1.5"><IconShield className="h-4 w-4 text-cb-accent" /> 사람 중심 AI</span>
                <span className="inline-flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-cb-accent" /> 자동배정 배제</span>
                <span className="inline-flex items-center gap-1.5"><IconDB className="h-4 w-4 text-cb-accent" /> 공공데이터 RAG 그라운딩</span>
              </div>
            </div>

            {/* 히어로 비주얼 */}
            <Figure
              src="/images/hero-bridge-night.png"
              alt="밤의 돌봄 공백을 잇는 케어브릿지 — 야간 동네 위 빛의 다리"
              ratio="4 / 3"
              priority
              className="lg:ml-auto lg:max-w-xl"
            />
          </div>

          {/* 72시간 프로토콜 스트립 */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROTOCOL.map((p) => (
              <div key={p.w} className="cb-card flex items-center gap-3 px-4 py-3">
                <span className={`flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold ${p.bg} ${p.c}`}>{p.w}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                    <span className="text-sm font-bold text-cb-ink">{p.g}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-cb-muted">제도·기관 후보 + 확인 질문</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 문제 */}
      <section className="cb-container py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <Figure
            src="/images/problem-gap.png"
            alt="보호자 공백의 밤 — 연결되지 못한 한 가정"
            ratio="4 / 3"
          />
          <div>
            <span className="cb-eyebrow">왜 필요한가</span>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-cb-ink">제도는 늘었지만, 위기의 순간은 비어 있습니다</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-cb-muted">
              어떤 제도가 해당되는지, 어느 기관이 대상자 특성에 맞는지, 야간·휴일에 무엇을 확인해야 하는지를 담당자가
              전화·수기로 즉시 결합하기는 어렵습니다. 케어브릿지 72는 바로 이 <b className="text-cb-ink">긴급 연결 구간</b>을 보조합니다.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatCard value="2,631,356명" label="등록장애인 (2024년 말)" sub="전체 인구의 5.1%" />
              <StatCard value="55.3%" label="65세 이상 비율" sub="장애·고령화 동시 진행" tone="accent" />
              <StatCard value="2,340명" label="최중증 발달장애 통합돌봄" sub="2024.6.11. 시행" tone="ink" />
            </div>
          </div>
        </div>
      </section>

      {/* 작동 방식 6단계 */}
      <section className="border-y border-cb-border bg-white py-14">
        <div className="cb-container">
          <h2 className="text-xl font-extrabold tracking-tight text-cb-ink">작동 방식 · 6단계</h2>
          <p className="mt-1.5 text-sm text-cb-muted">담당자 한 명이 접수부터 사후 리포트까지 하나의 콘솔에서 처리합니다.</p>

          <Figure
            src="/images/protocol-72h.png"
            alt="72시간 대응 흐름 — 0–2h·2–24h·24–72h·사후"
            ratio="21 / 9"
            className="mt-6"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="cb-card cb-card-pad transition hover:shadow-card-hover">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cb-primary-light text-cb-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-bold text-cb-ink">
                    <span className="text-cb-primary">{s.n}</span> {s.t}
                  </span>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-cb-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7종 공공데이터 */}
      <section className="cb-container py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <IconDB className="h-6 w-6 text-cb-primary" />
              <h2 className="text-xl font-extrabold tracking-tight text-cb-ink">7종 공공데이터를 판단의 핵심 입력값으로</h2>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cb-muted">
              공공데이터를 단순 조회가 아니라 <b className="text-cb-ink">제도 가능성·기관 연결·서비스 품질·접근성</b>을 판단하는 입력값으로 사용합니다.
              AI는 자동 배정하지 않고, 기관 우선순위는 공공데이터 기반 결정론적 점수로 산정합니다.
            </p>
          </div>
          <Figure
            src="/images/data-network.png"
            alt="7종 공공데이터가 결합되는 구조"
            ratio="4 / 3"
          />
        </div>
        <div className="mt-7">
          <DataSourceGrid />
        </div>
      </section>

      {/* 차별성 */}
      <section className="border-t border-cb-border bg-white py-14">
        <div className="cb-container">
          <h2 className="text-xl font-extrabold tracking-tight text-cb-ink">무엇이 다른가 · 정보 안내 → 실행안 생성</h2>
          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            {DIFF.map((d) => (
              <div key={d.name} className="rounded-xl border border-cb-border bg-cb-surface/60 p-4">
                <div className="text-sm font-bold text-cb-ink">{d.name}</div>
                <div className="mt-1 text-[12.5px] text-cb-muted">{d.role}</div>
                <div className="mt-2 text-[12.5px] text-cb-muted">한계 · {d.limit}</div>
              </div>
            ))}
            <div className="rounded-xl border-2 border-cb-primary bg-cb-primary-light/50 p-4">
              <div className="text-sm font-extrabold text-cb-primary-dark">케어브릿지 72</div>
              <div className="mt-1 text-[12.5px] font-semibold text-cb-ink">72시간 실행 대응안 생성</div>
              <div className="mt-2 text-[12.5px] text-cb-muted">상담 구조화 + 후보 압축 + 담당자 확인질문 + 처리결과 축적</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI + CTA */}
      <section className="cb-container py-14">
        <h2 className="text-xl font-extrabold tracking-tight text-cb-ink">6개월 지자체 실증 목표</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value="40→15분" label="초기 정리·후보탐색 시간" sub="담당자 업무시간 단축" />
          <StatCard value="200건" label="긴급 상담 처리" sub="실증 처리 로그" tone="accent" />
          <StatCard value="60%+" label="상위 3후보 연계가능 포함률" sub="담당자 확인 결과" />
          <StatCard value="90%+" label="2시간 내 안전확인 기록" sub="접수–기록 시각 비교" tone="ink" />
        </div>

        <div className="mt-8 cb-card cb-card-pad">
          <div className="grid items-center gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <Figure
              src="/images/impact-morning.png"
              alt="72시간 후, 회복된 아침"
              ratio="4 / 3"
            />
            <div>
              <EthicsBanner />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-cb-muted">
                  성남시 야간 응급입원 사례가 콘솔에 기본 탑재되어 있습니다. 바로 분석을 실행해 보세요.
                </p>
                <Link href="/console" className="cb-btn-primary !px-5 !py-3">
                  콘솔에서 분석 실행 <IconArrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
