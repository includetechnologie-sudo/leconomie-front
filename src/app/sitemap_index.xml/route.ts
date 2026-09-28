import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/sitemap";

// Ancienne adresse (Rank Math) : l'index vit désormais sur /sitemap.xml
export function GET() {
  return NextResponse.redirect(`${SITE_URL}/sitemap.xml`, 301);
}
