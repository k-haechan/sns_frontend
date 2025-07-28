import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // static.sns1.haechan.site 도메인 추가
      {
        protocol: "https",
        hostname: "static.sns1.haechan.site",
        pathname: "/images/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
