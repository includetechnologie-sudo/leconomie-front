import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseAccessCookie } from "@/lib/subscription";

const FILE = path.join(process.cwd(), "data", "lectures.json");
const MAX_PAR_ABONNE = 1000;

interface Lecture {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  minutes: number;
  readAt: string; // ISO
}

type LecturesData = Record<string, Lecture[]>;

function readLectures(): LecturesData {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeLectures(data: LecturesData) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("abonne_access");
  if (!cookie) return null;
  return parseAccessCookie(cookie.value);
}

function todayKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

// Enregistre une nouvelle lecture d'article pour l'abonné connecté (déduplique par jour + slug).
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });

  const title: string = body?.title || slug;
  const category: string = body?.category || "";
  const categorySlug: string = body?.categorySlug || "";
  const minutes: number = Number.isFinite(body?.minutes) ? Math.max(1, Math.round(body.minutes)) : 1;

  const data = readLectures();
  const list = data[user.email] || [];
  const now = new Date().toISOString();

  const alreadyReadToday = list.some((l) => l.slug === slug && todayKey(l.readAt) === todayKey(now));
  if (!alreadyReadToday) {
    list.unshift({ slug, title, category, categorySlug, minutes, readAt: now });
    data[user.email] = list.slice(0, MAX_PAR_ABONNE);
    writeLectures(data);
  }

  return NextResponse.json({ ok: true, recorded: !alreadyReadToday });
}

// Statistiques de lecture de l'abonné connecté, pour l'espace compte (tableau de bord).
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const data = readLectures();
  const list = data[user.email] || [];

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = list.filter((l) => l.readAt.slice(0, 7) === monthKey);

  const categoryCounts = new Map<string, number>();
  for (const l of list) {
    if (!l.category) continue;
    categoryCounts.set(l.category, (categoryCounts.get(l.category) || 0) + 1);
  }
  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return NextResponse.json({
    articlesLusTotal: list.length,
    articlesLusCeMois: thisMonth.length,
    minutesLuesCeMois: thisMonth.reduce((sum, l) => sum + l.minutes, 0),
    topCategories,
    recent: list.slice(0, 10),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
