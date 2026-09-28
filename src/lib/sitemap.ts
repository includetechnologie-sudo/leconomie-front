import { NextResponse } from "next/server";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
export const WP_URL = "https://teal-horse-411567.hostingersite.com";

// Seuls les sitemaps d'articles de Rank Math sont repris : les autres
// (pages WP, journal, magazine, layouts Elementor…) n'ont pas d'équivalent public côté Next.
export const WP_POST_SITEMAP = /^post-sitemap\d*\.xml$/;

export function xmlResponse(xml: string) {
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export async function fetchWp(file: string): Promise<string> {
  const res = await fetch(`${WP_URL}/${file}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`WordPress ${file} : ${res.status}`);
  return res.text();
}

// Les URL WordPress `/{slug}/` deviennent `/article/{slug}` côté Next.
// Les <image:loc> restent sur WordPress, où les médias sont réellement servis.
export function rewritePostSitemap(xml: string): string {
  return xml
    .replace(/<\?xml-stylesheet[^>]*\?>/, "")
    .replace(/<loc>\s*([^<]+?)\s*<\/loc>/g, (_m, url: string) => {
      if (!url.startsWith(`${WP_URL}/`)) return `<loc>${url}</loc>`;
      const slug = url.slice(WP_URL.length + 1).replace(/\/$/, "");
      return `<loc>${slug ? `${SITE_URL}/article/${slug}` : `${SITE_URL}/`}</loc>`;
    });
}
