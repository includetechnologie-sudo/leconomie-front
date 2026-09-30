import { NextResponse } from "next/server";
import { SITE_URL, WP_POST_SITEMAP, fetchWp, xmlResponse } from "@/lib/sitemap";

// Index des sitemaps : pages/rubriques générées ici + sitemaps d'articles de Rank Math réécrits.
export async function GET() {
  let wpIndex: string;
  try {
    wpIndex = await fetchWp("sitemap_index.xml");
  } catch {
    return new NextResponse("Sitemap indisponible", { status: 503 });
  }

  const now = new Date().toISOString();
  const entries = [
    { loc: `${SITE_URL}/sitemaps/pages.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-news.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemaps/videos.xml`, lastmod: now },
  ];

  for (const m of wpIndex.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    const file = m[1].trim().split("/").pop() || "";
    if (!WP_POST_SITEMAP.test(file)) continue;
    entries.push({ loc: `${SITE_URL}/sitemaps/${file}`, lastmod: m[2] || now });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <sitemap>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </sitemap>`).join("\n")}
</sitemapindex>`;

  return xmlResponse(xml);
}
