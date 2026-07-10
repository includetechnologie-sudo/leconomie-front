import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    const WP = "https://teal-horse-411567.hostingersite.com";
    return [
      { source: "/contacts", destination: "/contact", permanent: true },
      // Sitemaps WordPress
      { source: "/sitemap_index.xml", destination: `${WP}/sitemap_index.xml`, permanent: false },
      { source: "/sitemap.xml", destination: `${WP}/sitemap_index.xml`, permanent: false },
      { source: "/:sitemap(post-sitemap\\d*\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(page-sitemap\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(category-sitemap\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(journal-sitemap\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(magazine-sitemap\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(author-sitemap\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      { source: "/:sitemap(post_tag-sitemap\\d*\\.xml)", destination: `${WP}/:sitemap`, permanent: false },
      // Robots.txt depuis WordPress
      { source: "/robots.txt", destination: `${WP}/robots.txt`, permanent: false },
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

export default withPWA(nextConfig);
