import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseAccessCookie } from "@/lib/subscription";
import { REACTION_TYPES, ReactionType, isReactionType } from "@/lib/reactions";

const FILE = path.join(process.cwd(), "data", "reactions.json");

interface ReactionBucket { anonyme: number; abonne: number }
interface ArticleReactions {
  counts: Record<ReactionType, ReactionBucket>;
  byIdentity: Record<string, { type: ReactionType; isAbonne: boolean }>;
}
type ReactionsData = Record<string, ArticleReactions>;

function emptyCounts(): Record<ReactionType, ReactionBucket> {
  const counts = {} as Record<ReactionType, ReactionBucket>;
  for (const t of REACTION_TYPES) counts[t] = { anonyme: 0, abonne: 0 };
  return counts;
}

function readData(): ReactionsData {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeData(data: ReactionsData) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("abonne_access");
  if (!cookie) return null;
  return parseAccessCookie(cookie.value);
}

function totals(counts: Record<ReactionType, ReactionBucket>): Record<ReactionType, number> {
  const out = {} as Record<ReactionType, number>;
  for (const t of REACTION_TYPES) out[t] = counts[t].anonyme + counts[t].abonne;
  return out;
}

function identityKey(req: NextRequest, visitorId?: string | null): { key: string; isAbonne: boolean } | null {
  const user = getUser(req);
  if (user) return { key: `user:${user.email}`, isAbonne: true };
  if (visitorId) return { key: `anon:${visitorId}`, isAbonne: false };
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const visitorId = searchParams.get("visitorId");
  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });

  const data = readData();
  const entry = data[slug];
  const counts = totals(entry?.counts || emptyCounts());

  const ident = identityKey(req, visitorId);
  const mine = ident && entry?.byIdentity[ident.key];
  const myReaction: ReactionType | null = mine ? mine.type : null;

  return NextResponse.json({ counts, myReaction });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { slug, type, visitorId } = body as { slug?: string; type?: string; visitorId?: string };

  if (!slug || !isReactionType(type)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const ident = identityKey(req, visitorId);
  if (!ident) return NextResponse.json({ error: "visitorId requis" }, { status: 400 });

  const data = readData();
  if (!data[slug]) data[slug] = { counts: emptyCounts(), byIdentity: {} };
  const entry = data[slug];
  for (const t of REACTION_TYPES) if (!entry.counts[t]) entry.counts[t] = { anonyme: 0, abonne: 0 };

  const bucket = ident.isAbonne ? "abonne" : "anonyme";
  const prior = entry.byIdentity[ident.key];
  let myReaction: ReactionType | null;

  if (prior && prior.type === type) {
    // Re-clic sur la même réaction : on annule
    const priorBucket = prior.isAbonne ? "abonne" : "anonyme";
    entry.counts[prior.type][priorBucket] = Math.max(0, entry.counts[prior.type][priorBucket] - 1);
    delete entry.byIdentity[ident.key];
    myReaction = null;
  } else {
    if (prior) {
      const priorBucket = prior.isAbonne ? "abonne" : "anonyme";
      entry.counts[prior.type][priorBucket] = Math.max(0, entry.counts[prior.type][priorBucket] - 1);
    }
    entry.counts[type][bucket] += 1;
    entry.byIdentity[ident.key] = { type, isAbonne: ident.isAbonne };
    myReaction = type;
  }

  writeData(data);
  return NextResponse.json({ counts: totals(entry.counts), myReaction });
}
