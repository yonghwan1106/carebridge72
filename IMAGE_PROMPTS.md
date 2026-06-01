# 케어브릿지 72 · 홈페이지 이미지 생성 프롬프트

홈페이지(대시보드)를 텍스트 위주에서 벗어나게 할 **5개 핵심 이미지 + 1개 OG(선택)**.
하나의 서사 아크 — **밤의 돌봄 공백(위기) → 케어브릿지(연결) → 72시간 후의 아침(회복)** — 으로 묶고,
브랜드 색(네이비·틸·크림)과 "빛의 다리(care bridge)" 메타포로 톤을 통일합니다.

## 사용 방법
1. **나노바나나(Gemini 2.5 Flash Image)** 로 1~5번 생성. 메인 추천.
   - 먼저 `1) hero` 를 생성하고, 마음에 들면 2~5번 생성 시 **hero 이미지를 스타일 참조로 업로드**하고
     프롬프트 끝에 `same illustration style, palette and lighting as the reference image` 를 붙이면 5장이 한 세트처럼 통일됩니다.
2. 텍스트가 들어가는 **6) OG 이미지**는 **ChatGPT Images 2.0**(텍스트 정확도 99%) 권장.
3. 출력은 **PNG**, 아래 권장 비율로. 파일명을 **정확히 일치**시켜 `public/images/` 에 저장.
4. `git add . && git commit && git push` → **Vercel 자동 재배포**. (파일이 없으면 브랜드 그라데이션 플레이스홀더가 표시되므로 한 장씩 추가해도 안전)

---

## ★ 공통 스타일 앵커 (모든 프롬프트 앞/뒤에 붙이거나 참조 이미지로 고정)

```
Warm modern editorial illustration for a public social-welfare AI service.
Soft airbrushed gradients with a subtle paper grain, rounded organic geometric shapes,
clean composition with generous negative space, gentle cinematic lighting,
dignified, hopeful, trustworthy mood.
Cohesive limited palette: deep night navy (#0E1B3A to #0E4D8C), luminous teal (#0E9594),
warm cream (#F6F1E7), soft amber-coral glow (#E8956B).
Korean urban residential setting (apartment complexes, a quiet neighborhood).
ABSOLUTELY NO text, no letters, no numbers, no logos, no UI screens, no detailed human faces.
High-end, professional, suitable for a government social-welfare proposal. 16:10-friendly.
```

**공통 네거티브(Negative):** `text, letters, words, numbers, captions, logo, watermark, UI, screenshot, detailed human faces, deformed faces, creepy, hospital gore, blood, harsh neon, low quality, cluttered, busy`

---

## 1) `hero-bridge-night.png` — 히어로 (권장 1600×1200, 4:3)

**배치:** 첫 화면 우측 메인 비주얼

```
A luminous "bridge of care" arcing across a calm night sky over a Korean apartment neighborhood.
On the LEFT, a single apartment tower with one window glowing warm amber — a family that needs help tonight.
From that window a graceful ribbon of teal-and-gold light arcs across the sky like a bridge,
connecting to the RIGHT side where soft glowing care points cluster: a small community welfare center,
a clinic, and a care facility, drawn as simple rounded buildings emitting gentle light and marked only
with soft universal care symbols (a heart, a plus/cross, a shelter shape — no text).
The bridge is made of flowing luminous strands that suggest both data and human connection.
Deep navy gradient sky with a few soft stars, distant city silhouettes below, gentle mist.
Mood: protective, hopeful, calm in the middle of the night. Cinematic wide composition,
the glowing bridge as the clear hero element. [+ 공통 스타일 앵커]
```

## 2) `problem-gap.png` — 문제 섹션 (권장 1200×900, 4:3)

**배치:** "돌봄 공백" 통계 옆 (감성적 환기)

```
A quiet, emotional scene of care DISCONNECTION at deep night.
A large dark Korean apartment facade fills the frame; almost every window is dark,
only ONE window glows warm and anxious. From that lone window, faint dotted threads of light
reach outward into the surrounding darkness but BREAK APART and fade before connecting to anything —
visualizing a "care gap" where help cannot be reached in time.
In the night sky, a faint oversized ring of light hints at a late clock (no readable numbers),
suggesting a time-critical late hour. Palette dominated by deep navy and shadow with a single tender warm light.
Mood: isolation and urgency, yet composed and dignified — not frightening. Lots of dark negative space.
[+ 공통 스타일 앵커]
```

## 3) `protocol-72h.png` — 작동 방식 배너 (권장 2100×900, 21:9 와이드)

**배치:** "작동 방식 6단계" 위 가로 배너

```
A horizontal "timeline bridge" spanning left to right across a soft abstract map of a Korean district
(gentle simplified streets and a few location pins, no labels).
Four glowing waypoint orbs sit evenly along the bridge, escalating in color to show urgency phases:
the first a soft warm red, the second amber, the third luminous teal, the fourth a calm green,
all linked by a smooth flowing ribbon of light. Beneath each orb a tiny care icon glows
(shield, cupped hands, building, leaf) with no text. Clean infographic-like illustration,
lots of breathing room above and below so captions can be added later in layout.
Bright, optimistic, daytime-soft palette over a navy structure with teal and gold accents.
[+ 공통 스타일 앵커]
```

## 4) `data-network.png` — 공공데이터 섹션 (권장 1200×900, 4:3)

**배치:** "7종 공공데이터" 설명 옆

```
An elegant abstract visualization of seven public-data streams converging to power a central care hub.
Seven distinct softly glowing nodes arranged in a gentle arc, each a minimalist icon-like symbol
(a building, a quality-check shield, a wheelchair-accessibility mark, a document/folder, a small bar chart,
a map pin, a cupped hand) — all simple, NO text. From each node a luminous teal-and-gold data ribbon
flows gracefully toward a glowing central core shaped like a small bridge keystone,
which then emits a single confident beam of connection.
Deep navy background, premium and trustworthy, like a refined data illustration. Balanced and calm.
[+ 공통 스타일 앵커]
```

## 5) `impact-morning.png` — 기대효과/마무리 (권장 1200×900, 4:3)

**배치:** 마지막 CTA 카드 좌측 (회복·희망)

```
The same Korean apartment neighborhood as the hero image, now at gentle SUNRISE the morning after.
Warm cream and soft teal dawn sky; the "care bridge" of light is now COMPLETE and softly glowing,
several windows warmly lit, signaling safety and connection.
In the lower foreground, two simple rounded silhouetted figures stand together calmly —
a caregiver beside a young person — seen from behind or in soft shadow, dignified and supportive,
with no detailed faces. A few small care-point buildings glow gently in the distance,
all linked by soft light threads. Mood: relief, warmth, community, resolution after a hard night.
[+ 공통 스타일 앵커]
```

---

## 6) `og-cover.png` — (선택) 소셜/메타 미리보기 (1200×630) — **ChatGPT Images 2.0 권장(텍스트)**

**배치:** 링크 공유 시 미리보기 카드 (layout 메타에 연결됨)

```
A clean hero banner for a public-welfare AI service.
LEFT: a bold modern Korean+English lockup reading "케어브릿지 72" with a small "CareBridge 72" beneath,
and a one-line tagline "돌봄 공백을 72시간 안에 잇습니다" in a refined navy sans-serif.
RIGHT: a small elegant illustration of a luminous teal bridge of light arcing over a night neighborhood
(same style as the project). Background a deep navy-to-teal gradient, generous margins,
crisp legible Korean typography, professional and trustworthy. 1200x630, balanced layout.
```

> ⚠️ 6번만 텍스트 포함입니다. 1~5번은 반드시 **텍스트 없이** 생성하세요(라벨은 사이트가 코드로 얹습니다).

---

## 파일명 요약 (이 이름 그대로 `public/images/` 에 저장)

| 파일명 | 비율 | 위치 |
|---|---|---|
| `hero-bridge-night.png` | 4:3 (1600×1200) | 히어로 |
| `problem-gap.png` | 4:3 (1200×900) | 문제 섹션 |
| `protocol-72h.png` | 21:9 (2100×900) | 작동 방식 배너 |
| `data-network.png` | 4:3 (1200×900) | 공공데이터 섹션 |
| `impact-morning.png` | 4:3 (1200×900) | 마무리 CTA |
| `og-cover.png` (선택) | 1.91:1 (1200×630) | 소셜 미리보기 |
