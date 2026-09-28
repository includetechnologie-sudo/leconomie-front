import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/sitemap";

// Ancienne adresse des sous-sitemaps (bloquée par robots.txt via /api/) : redirige vers /sitemaps/
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  return NextResponse.redirect(`${SITE_URL}/sitemaps/${encodeURIComponent(file)}`, 301);
}
