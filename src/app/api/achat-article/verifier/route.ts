import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ACHATS_FILE = path.join(process.cwd(), "data", "achats-articles.json");

interface AchatArticle {
  email: string;
  slug: string;
  purchasedAt: string;
  reference: string;
  expiresAt: string;
}

function readAchats(): AchatArticle[] {
  try {
    return JSON.parse(fs.readFileSync(ACHATS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const slug = searchParams.get("slug");

  if (!email || !slug) {
    return NextResponse.json({ access: false });
  }

  const achats = readAchats();
  const now = new Date();

  const valid = achats.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.slug === slug && new Date(a.expiresAt) > now
  );

  if (valid) {
    return NextResponse.json({
      access: true,
      expiresAt: valid.expiresAt,
    });
  }

  return NextResponse.json({ access: false });
}