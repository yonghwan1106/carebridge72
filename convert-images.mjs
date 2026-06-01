// 홈페이지 이미지 PNG → WebP 변환(리사이즈 포함). 발표 데모 로드 속도 개선.
// 실행: npm i -D sharp && node convert-images.mjs
import sharp from "sharp";

const dir = "public/images";
const targets = [
  { f: "hero-bridge-night", w: 1200 },
  { f: "problem-gap", w: 1000 },
  { f: "protocol-72h", w: 1600 },
  { f: "data-network", w: 1000 },
  { f: "impact-morning", w: 1000 },
];

let total = 0;
for (const t of targets) {
  const info = await sharp(`${dir}/${t.f}.png`)
    .resize({ width: t.w, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${dir}/${t.f}.webp`);
  total += info.size;
  console.log(`${t.f}.webp  ${(info.size / 1024).toFixed(0)}KB  ${info.width}x${info.height}`);
}
console.log(`총 WebP 합계 ≈ ${(total / 1024 / 1024).toFixed(2)}MB`);
console.log("done");
