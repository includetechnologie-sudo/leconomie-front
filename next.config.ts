import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      { source: "/contacts", destination: "/contact", permanent: true },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "leconomie.info" },
      { protocol: "https", hostname: "www.leconomie.info" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i1.ytimg.com" },
      { protocol: "https", hostname: "i2.ytimg.com" },
      { protocol: "https", hostname: "i3.ytimg.com" },
      { protocol: "https", hostname: "i4.ytimg.com" },
      { protocol: "https", hostname: "teal-horse-411567.hostingersite.com" },
    ],
  },
};

export default nextConfig;
