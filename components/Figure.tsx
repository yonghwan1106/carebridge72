"use client";

import { useState } from "react";

/**
 * 이미지 슬롯. /public/images 의 PNG 를 표시하고,
 * 파일이 아직 없으면(404) 브랜드 그라데이션 플레이스홀더로 우아하게 대체한다.
 * → AI 생성 이미지를 같은 파일명으로 넣으면 자동으로 교체됨(깨진 이미지 없음).
 */
export function Figure({
  src,
  alt,
  caption,
  ratio = "16 / 10",
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  const [err, setErr] = useState(false);
  return (
    <figure className={className}>
      <div
        className="relative overflow-hidden rounded-2xl border border-cb-border shadow-card"
        style={{ aspectRatio: ratio }}
      >
        {!err ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onError={() => setErr(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cb-primary-light via-white to-cb-accent-light px-4 text-center text-cb-primary/55">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9.5" r="1.6" />
              <path d="M21 16l-5-5L5 20" />
            </svg>
            <span className="text-[11.5px] font-semibold leading-snug">{alt}</span>
          </div>
        )}
      </div>
      {caption && <figcaption className="mt-2 text-center text-[12px] text-cb-muted">{caption}</figcaption>}
    </figure>
  );
}
