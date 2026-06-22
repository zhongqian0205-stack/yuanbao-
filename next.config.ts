import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    // 让打包后的 next dev 能从 app bundle 的任意子目录正确定位项目根
    root: path.join(__dirname),
  },
};

export default nextConfig;