import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analyze";
import type { IntakeRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body?.text ?? "").trim();
    if (text.length < 5) {
      return NextResponse.json({ error: "돌봄 공백 상황을 조금 더 자세히 입력해 주세요." }, { status: 400 });
    }
    const intake: IntakeRequest = {
      text: text.slice(0, 4000),
      region: body?.region ? String(body.region).slice(0, 60) : undefined,
      occurredAt: body?.occurredAt ? String(body.occurredAt).slice(0, 40) : undefined,
      consent: Boolean(body?.consent),
    };
    const result = await runAnalysis(intake);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[carebridge72] /api/analyze error:", e);
    return NextResponse.json({ error: "분석 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
