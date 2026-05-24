import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
    serverSourceMaps: true,
  },
  allowedDevOrigins: ["192.168.0.41"],
};

export default nextConfig;
