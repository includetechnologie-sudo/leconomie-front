import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_MAP } from "@/lib/categories";
import { SITE_URL, WP_POST_SITEMAP, fetchWp, rewritePostSitemap, xmlResponse } from "@/lib/sitemap";

const CEMAC_PAYS = ["cameroun", "tchad", "rca", "congo", "gabon", "guinee-equatoriale"];
const UEMOA_PAYS = ["senegal", "cote-d-ivoire", "mali", "burkina-faso", "niger", "benin", "togo", "guinee-bissau"];

const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/articles-premium", changefreq: "daily", priority: "0.8" },
  { path: "/magazine", changefreq: "weekly", priority: "0.8" },
  { path: "/abonnement", changefreq: "monthly", priority: "0.6" },
  { path: "/cemac", changefreq: "daily", priority: "0.7" },
  { path: "/uemoa", changefreq: "daily", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.3" },
  ...CEMAC_PAYS.map((p) => ({ path: `/cemac/${p}`, changefreq: "daily", priority: "0.6" })),
  ...UEMOA_PAYS.map((p) => ({ path: `/uemoa/${p}`, changefreq: "daily", priority: "0.6" })),
  // "infrastructures" est un alias de "infrastructure" : une seule URL par rubrique
  ...Object.keys(CATEGORY_MAP)
    .filter((slug) => slug !== "infrastructures")
    .map((slug) => ({ path: `/${slug}`, changefreq: "daily", priority: "0.6" })),
];

function pagesSitemap(): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map((p) => `  <url>\n    <loc>${SITE_URL}${p.path === "/" ? "/" : p.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join("\n")}
</urlset>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  if (file === "pages.xml") return xmlResponse(pagesSitemap());

  if (!WP_POST_SITEMAP.test(file)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    return xmlResponse(rewritePostSitemap(await fetchWp(file)));
  } catch {
    return new NextResponse("Sitemap indisponible", { status: 503 });
  }
}
