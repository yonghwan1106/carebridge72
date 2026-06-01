/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 한글 경로(Windows)에서 Turbopack panic을 피하기 위해 기본 webpack 빌드를 사용합니다.
  // (dev 스크립트에 --turbopack 플래그를 넣지 않습니다.)
};

module.exports = nextConfig;
