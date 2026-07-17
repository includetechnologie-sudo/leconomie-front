import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "banners.json");
const TOKEN = process.env.DASHBOARD_TOKEN || "EmGTheli@2026";

interface Banner {
  id: string;
  label: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  active: boolean;
}

function readBanners(): Banner[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch { return []; }
}

function writeBanners(banners: Banner[]) {
  fs.writeFileSync(FILE, JSON.stringify(banners, null, 2));
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-dashboard-token");
  const id = req.nextUrl.searchParams.get("id");

  if (!token || token !== TOKEN) {
    const banners = readBanners().filter(b => b.active);
    if (id) {
      const banner = banners.find(b => b.id === id);
      return NextResponse.json(banner || null);
    }
    return NextResponse.json(banners);
  }

  return NextResponse.json(readBanners());
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("x-dashboard-token");
  if (!token || token !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const banners = readBanners();
  const idx = banners.findIndex(b => b.id === body.id);

  if (idx >= 0) {
    banners[idx] = { ...banners[idx], ...body };
  } else {
    banners.push(body);
  }

  writeBanners(banners);
  return NextResponse.json({ ok: true, banners });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-dashboard-token");
  if (!token || token !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await req.json();
  const banners = readBanners().filter(b => b.id !== id);
  writeBanners(banners);
  return NextResponse.json({ ok: true, banners });
}
