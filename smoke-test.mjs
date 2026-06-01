// 로컬 스모크 테스트: 서버 기동 대기 → /api/analyze 호출 → 결과 요약 출력
const base = process.env.CB_BASE || "http://localhost:3000";
const payload = {
  text:
    "오늘 21시 30분경 분당구 정자동에 사는 17세 최중증 발달장애인 A의 어머니(주 보호자)가 갑자기 쓰러져 응급실에 입원했습니다. 아버지는 지방 출장 중이라 당장 돌볼 가족이 없습니다. A는 평소 장애인활동지원 서비스를 이용 중이고 의사소통이 거의 안 되며 야간 불안과 자해 위험이 있어 혼자 두기 어렵습니다. 복약도 챙겨야 합니다. 내일 오전까지 대체 돌봄이 필요합니다.",
  region: "성남시 분당구",
  occurredAt: "21:30",
  consent: true,
};

async function waitUp(tries = 45) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(base + "/");
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

(async () => {
  const up = await waitUp();
  if (!up) {
    console.log("SERVER NOT UP");
    process.exit(1);
  }
  console.log("server up; POST /api/analyze ...");
  const t = Date.now();
  const res = await fetch(base + "/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("HTTP", res.status, "in", Date.now() - t, "ms");
  const r = await res.json();
  if (r.error) {
    console.log("ERROR:", r.error);
    process.exit(1);
  }
  console.log("engine     :", r.engine, "| model:", r.model);
  console.log("caseId     :", r.caseId, "| region:", r.region, "| elapsedMs:", r.elapsedMs);
  console.log("urgency    :", r.urgency?.level, r.urgency?.score, "|", (r.urgency?.safetyFlags || []).join(" / "));
  console.log("targetType :", r.structured?.targetType);
  console.log("features   :", (r.structured?.disabilityFeatures || []).join(", "));
  console.log("phases     :", r.phases?.length, "->", (r.phases || []).map((p) => p.phase).join(", "));
  console.log("dataSources:", (r.usedDataSources || []).join(" | "));
  for (const p of r.phases || []) {
    console.log(`  [${p.phase}] ${p.goal}`);
    console.log("    제도:", (p.programs || []).map((x) => x.program.name).join(", ") || "-");
    console.log("    기관:", (p.institutions || []).map((x) => `${x.institution.name}(${x.score})`).join(", ") || "-");
  }
  console.log("checklist  :", r.checklist?.length, "items");
  console.log("OK");
})();
