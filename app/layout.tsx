import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { TopNav, Footer } from "@/components/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://carebridge72-drab.vercel.app"),
  title: "케어브릿지 72 · 돌봄공백 72시간 긴급대응 AI",
  description:
    "최중증 발달장애인 보호자의 돌봄 공백이 발생했을 때, 7종 공공데이터와 AI로 지자체 담당자에게 72시간 긴급 대응안을 생성하는 의사결정 지원 서비스 (2026 국민행복 서비스 발굴·창업경진대회 프로토타입)",
  openGraph: {
    title: "케어브릿지 72 · 돌봄공백 72시간 긴급대응 AI",
    description:
      "보호자 공백 발생 시 7종 공공데이터와 AI로 지자체 담당자에게 72시간 긴급 대응안을 생성하는 의사결정 지원 서비스",
    url: "/",
    siteName: "케어브릿지 72",
    images: [{ url: "/images/og-cover.png", width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TopNav />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
