import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkDashboardAuth } from "@/lib/dashboard-auth";

const STATS_FILE = path.join(process.cwd(), "data", "newsletter-stats.json");

interface CampaignRaw {
  subject?: string;
  date?: string;
  sent?: number;
  total?: number;
  failed?: { email: string; error: string }[];
  opens?: string[];
  clicks?: { email: string; url: string; at: string }[];
  status?: string;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const raw = await fs.readFile(STATS_FILE, "utf-8");
    const stats: Record<string, CampaignRaw> = JSON.parse(raw);

    const campaigns = Object.entries(stats)
      .map(([id, data]) => {
        const sent = data.sent || 0;
        const total = data.total ?? sent;
        const failed = Array.isArray(data.failed) ? data.failed : [];
        const opens = Array.isArray(data.opens) ? data.opens.length : 0;
        const clicks = Array.isArray(data.clicks) ? data.clicks.length : 0;
        return {
          id,
          subject: data.subject || id,
          date: data.date || "",
          status: data.status || "terminé",
          total,
          sent,
          failedCount: failed.length,
          failedEmails: failed,
          opens,
          clicks,
          openRate: sent > 0 ? Math.round((opens / sent) * 100) : 0,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ campaigns: [] });
  }
}
