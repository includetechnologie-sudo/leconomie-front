import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "online.json");
const TTL = 30000; // 30 secondes

function read(): Record<string, number> {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return {}; }
}

function write(data: object) {
  try { fs.writeFileSync(FILE, JSON.stringify(data)); } catch {}
}

export async function POST(req: NextRequest) {
  const { uid } = await req.json().catch(() => ({ uid: null }));
  if (!uid) return NextResponse.json({ online: 0 });

  const now = Date.now();
  const data = read();
  data[uid] = now;

  // Purge les visiteurs inactifs depuis plus de 30s
  for (const k in data) {
    if (now - data[k] > TTL) delete data[k];
  }
  write(data);

  return NextResponse.json({ online: Object.keys(data).length });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (auth !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const now = Date.now();
  const data = read();
  const online = Object.values(data).filter(t => now - t <= TTL).length;
  return NextResponse.json({ online });
}
