import { NextRequest, NextResponse } from "next/server";

const WP = "https://teal-horse-411567.hostingersite.com";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  if (!file.endsWith(".xml")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const res = await fetch(`${WP}/${file}`, { next: { revalidate: 3600 } });
    if (!res.ok) return new NextResponse("Not found", { status: 404 });
    const xml = (await res.text()).replaceAll(WP, "https://leconomie.info");
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Indisponible", { status: 503 });
  }
}
