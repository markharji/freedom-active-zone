import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "magenta-patient-possum-850.mypinata.cloud", // Add your Pinata domain here
    ],
  },
};

export default nextConfig;
