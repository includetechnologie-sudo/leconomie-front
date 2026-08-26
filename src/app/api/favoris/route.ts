import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseAccessCookie } from "@/lib/subscription";

const FILE = path.join(process.cwd(), "data", "favoris.json");

interface Favori {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
  savedAt: string;
}

type FavorisData = Record<string, Favori[]>;

function readFavoris(): FavorisData {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeFavoris(data: FavorisData) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("abonne_access");
  if (!cookie) return null;
  return parseAccessCookie(cookie.value);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const data = readFavoris();
  const userFavoris = data[user.email] || [];

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const isSaved = userFavoris.some((f) => f.slug === slug);
    return NextResponse.json({ saved: isSaved });
  }

  return NextResponse.json({ favoris: userFavoris });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const body = await req.json();
  const { slug, title, image, category, date, action } = body;

  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });

  const data = readFavoris();
  if (!data[user.email]) data[user.email] = [];

  if (action === "remove") {
    data[user.email] = data[user.email].filter((f) => f.slug !== slug);
    writeFavoris(data);
    return NextResponse.json({ saved: false });
  }

  const exists = data[user.email].some((f) => f.slug === slug);
  if (exists) {
    data[user.email] = data[user.email].filter((f) => f.slug !== slug);
    writeFavoris(data);
    return NextResponse.json({ saved: false });
  }

  data[user.email].unshift({
    slug,
    title: title || slug,
    image: image || "",
    category: category || "",
    date: date || "",
    savedAt: new Date().toISOString(),
  });

  writeFavoris(data);
  return NextResponse.json({ saved: true });
}