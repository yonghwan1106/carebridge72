# /public/images

홈페이지에서 사용하는 이미지 폴더입니다. 아래 파일명을 **정확히 일치**시켜 PNG를 넣으면
홈페이지에 자동 반영됩니다. (파일이 없으면 브랜드 그라데이션 플레이스홀더가 표시되므로 한 장씩 추가해도 안전)

| 파일명 | 비율 | 위치 |
|---|---|---|
| `hero-bridge-night.png` | 4:3 | 히어로 우측 메인 |
| `problem-gap.png` | 4:3 | 문제(돌봄 공백) 섹션 |
| `protocol-72h.png` | 21:9 | 작동 방식 가로 배너 |
| `data-network.png` | 4:3 | 7종 공공데이터 섹션 |
| `impact-morning.png` | 4:3 | 마무리 CTA |
| `og-cover.png` | 1200×630 | (선택) 소셜 미리보기 |

생성 프롬프트는 프로젝트 루트 `IMAGE_PROMPTS.md` 참고.
이미지 추가 후 `git add . && git commit -m "chore: add homepage images" && git push` → Vercel 자동 재배포.
