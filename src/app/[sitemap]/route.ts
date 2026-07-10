import { NextRequest, NextResponse } from "next/server";

const WP = "https://teal-horse-411567.hostingersite.com";

// Proxy les sous-sitemaps WordPress : post-sitemap.xml, category-sitemap.xml, etc.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sitemap: string }> }
) {
  const { sitemap } = await params;

  // Accepte uniquement les fichiers .xml qui ressemblent à des sitemaps
  if (!sitemap.endsWith(".xml") || !sitemap.includes("sitemap")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const res = await fetch(`${WP}/${sitemap}`, { next: { revalidate: 3600 } });
    if (!res.ok) return new NextResponse("Not found", { status: 404 });
    const xml = await res.text();
    const fixed = xml.replaceAll(WP, "https://leconomie.info");
    return new NextResponse(fixed, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Sitemap indisponible", { status: 503 });
  }
}
