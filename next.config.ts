import type { NextConfig } from "next";
import { URL } from "url";

const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "";
const parsedStorageUrl = new URL(storageBaseUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: parsedStorageUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedStorageUrl.hostname,
        port: parsedStorageUrl.port || undefined,
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
