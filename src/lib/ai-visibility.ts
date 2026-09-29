import fs from "fs";
import path from "path";
import { AI_SOURCES, AI_BOTS, isAiSource } from "@/lib/ai-sources";

// Agrégats « Visibilité IA » pour le dashboard (data/ai-referrals.json + data/ai-bots.json)

type DayMap = Record<string, Record<string, number>>;

function readStore(file: string): { days: DayMap; pages: DayMap; updatedAt?: string } {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf-8"));
    return { days: s.days ?? {}, pages: s.pages ?? {}, updatedAt: s.updatedAt };
  } catch {
    return { days: {}, pages: {} };
  }
}

function lastDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10));
  return out;
}

function sumPages(pages: DayMap, dates: string[], top: number) {
  const acc: Record<string, number> = {};
  for (const d of dates) for (const [p, n] of Object.entries(pages[d] ?? {})) acc[p] = (acc[p] ?? 0) + n;
  return Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, top).map(([path, count]) => ({ path, count }));
}

export function getAiVisibility() {
  const d30 = lastDates(30);
  const d14 = lastDates(14);
  const d7 = lastDates(7);

  // Lecteurs envoyés par les assistants IA
  const refs = readStore("ai-referrals.json");
  const bySource: Record<string, number> = {};
  for (const d of d30) for (const [s, n] of Object.entries(refs.days[d] ?? {})) if (isAiSource(s)) bySource[s] = (bySource[s] ?? 0) + n;
  const referrals = {
    total30: Object.values(bySource).reduce((a, b) => a + b, 0),
    bySource: Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, label: AI_SOURCES[source as keyof typeof AI_SOURCES].label, count })),
    daily: d14.map((date) => ({ date, count: Object.values(refs.days[date] ?? {}).reduce((a, b) => a + b, 0) })),
    topPages: sumPages(refs.pages, d30, 10),
  };

  // Robots des IA et des moteurs (journaux nginx)
  const bots = readStore("ai-bots.json");
  const botRows = Object.entries(AI_BOTS).map(([key, meta]) => ({
    key,
    ...meta,
    last7: d7.reduce((a, d) => a + (bots.days[d]?.[key] ?? 0), 0),
    last30: d30.reduce((a, d) => a + (bots.days[d]?.[key] ?? 0), 0),
  })).filter((r) => r.last30 > 0).sort((a, b) => b.last7 - a.last7);
  const liveKeys = Object.entries(AI_BOTS).filter(([, m]) => m.kind === "live").map(([k]) => k);

  return {
    referrals,
    bots: {
      updatedAt: bots.updatedAt ?? null,
      rows: botRows,
      liveDaily: d14.map((date) => ({ date, count: liveKeys.reduce((a, k) => a + (bots.days[date]?.[k] ?? 0), 0) })),
      live7: d7.reduce((a, d) => a + liveKeys.reduce((b, k) => b + (bots.days[d]?.[k] ?? 0), 0), 0),
      topPages: sumPages(bots.pages, d7, 10),
    },
  };
}
