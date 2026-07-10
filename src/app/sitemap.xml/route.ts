import { NextResponse } from "next/server";

const WP = "https://teal-horse-411567.hostingersite.com";

export async function GET() {
  try {
    const res = await fetch(`${WP}/sitemap_index.xml`, { next: { revalidate: 3600 } });
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
