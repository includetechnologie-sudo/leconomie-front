import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAiSource } from "@/lib/ai-sources";

// Visites de lecteurs envoyés par un assistant IA → data/ai-referrals.json
// { days: { "AAAA-MM-JJ": { chatgpt: 3, … } }, pages: { "AAAA-MM-JJ": { "/article/x": 2, … } } }

const FILE = path.join(process.cwd(), "data", "ai-referrals.json");
const KEEP_DAYS = 120;

type Store = { days: Record<string, Record<string, number>>; pages: Record<string, Record<string, number>> };

function read(): Store {
  try {
    const s = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    return { days: s.days ?? {}, pages: s.pages ?? {} };
  } catch {
    return { days: {}, pages: {} };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { source, path: pagePath } = await req.json();
    if (!isAiSource(source)) return NextResponse.json({ ok: false }, { status: 400 });
    const page = typeof pagePath === "string" && pagePath.startsWith("/") ? pagePath.slice(0, 200) : "/";

    const today = new Date().toISOString().split("T")[0];
    const store = read();
    store.days[today] = store.days[today] ?? {};
    store.days[today][source] = (store.days[today][source] ?? 0) + 1;
    store.pages[today] = store.pages[today] ?? {};
    store.pages[today][page] = (store.pages[today][page] ?? 0) + 1;

    // Purge au-delà de KEEP_DAYS jours
    const limit = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().split("T")[0];
    for (const k of Object.keys(store.days)) if (k < limit) delete store.days[k];
    for (const k of Object.keys(store.pages)) if (k < limit) delete store.pages[k];

    fs.writeFileSync(FILE, JSON.stringify(store));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
