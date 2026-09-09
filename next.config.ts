import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Pin the project root so Turbopack doesn't walk up to ~/ (a stray
  // package-lock.json in the home dir otherwise makes it the workspace root).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
