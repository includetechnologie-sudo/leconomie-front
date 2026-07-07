import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function readJSON(file: string) {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf-8"));
  } catch { return {}; }
}

function writeJSON(file: string, data: object) {
  try {
    fs.writeFileSync(path.join(process.cwd(), "data", file), JSON.stringify(data, null, 2));
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    const today = new Date().toISOString().split("T")[0];

    // Visites journalières
    const visits = readJSON("visits.json") as Record<string, number>;
    visits[today] = (visits[today] || 0) + 1;
    writeJSON("visits.json", visits);

    // Vues par article
    if (slug) {
      const views = readJSON("article-views.json") as Record<string, number>;
      views[slug] = (views[slug] || 0) + 1;
      writeJSON("article-views.json", views);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
