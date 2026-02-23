import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = "source-map";
    }
    return config;
  },
  allowedDevOrigins: ["192.168.0.41"],
};

export default nextConfig;
