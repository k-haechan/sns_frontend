import type { NextConfig } from "next";
import { URL } from "url";

const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "";
const parsedStorageUrl = new URL(storageBaseUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // static.sns1.haechan.siteimages 도메인 추가
      {
        protocol: "https",
        hostname: "static.sns1.haechan.siteimages",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
