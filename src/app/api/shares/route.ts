import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseAccessCookie } from "@/lib/subscription";
import { SHARE_NETWORKS, ShareNetwork, isShareNetwork } from "@/lib/shares";

const FILE = path.join(process.cwd(), "data", "shares.json");

interface ShareBucket { anonyme: number; abonne: number }
type SharesData = Record<string, { counts: Record<ShareNetwork, ShareBucket> }>;

function emptyCounts(): Record<ShareNetwork, ShareBucket> {
  const counts = {} as Record<ShareNetwork, ShareBucket>;
  for (const n of SHARE_NETWORKS) counts[n] = { anonyme: 0, abonne: 0 };
  return counts;
}

function readData(): SharesData {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeData(data: SharesData) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("abonne_access");
  if (!cookie) return null;
  return parseAccessCookie(cookie.value);
}

function totals(counts: Record<ShareNetwork, ShareBucket>): Record<ShareNetwork, number> {
  const out = {} as Record<ShareNetwork, number>;
  for (const n of SHARE_NETWORKS) out[n] = counts[n].anonyme + counts[n].abonne;
  return out;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });

  const data = readData();
  const counts = totals(data[slug]?.counts || emptyCounts());
  return NextResponse.json({ counts });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { slug, network } = body as { slug?: string; network?: string };

  if (!slug || !isShareNetwork(network)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const data = readData();
  if (!data[slug]) data[slug] = { counts: emptyCounts() };
  const entry = data[slug];
  for (const n of SHARE_NETWORKS) if (!entry.counts[n]) entry.counts[n] = { anonyme: 0, abonne: 0 };

  const bucket = getUser(req) ? "abonne" : "anonyme";
  entry.counts[network][bucket] += 1;

  writeData(data);
  return NextResponse.json({ counts: totals(entry.counts) });
}
