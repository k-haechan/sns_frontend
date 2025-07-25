import type { NextConfig } from "next";
import { URL } from "url";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const parsedUrl = new URL(apiBaseUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: parsedUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: `${parsedUrl.pathname}**`,
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
