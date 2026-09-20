import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STATS_FILE = path.join(process.cwd(), "data", "newsletter-stats.json");

interface NewsletterStats {
  [campaignId: string]: {
    sent: number;
    opens: string[];
    clicks: { email: string; url: string; at: string }[];
  };
}

async function readStats(): Promise<NewsletterStats> {
  try {
    return JSON.parse(await fs.readFile(STATS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeStats(stats: NewsletterStats) {
  await fs.mkdir(path.dirname(STATS_FILE), { recursive: true });
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Pixel d'ouverture (1x1 transparent GIF)
// URL: /api/newsletter/track?type=open&cid=xxx&email=xxx
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const cid = req.nextUrl.searchParams.get("cid") || "unknown";
  const email = req.nextUrl.searchParams.get("email") || "";
  const url = req.nextUrl.searchParams.get("url") || "";

  try {
    const stats = await readStats();
    if (!stats[cid]) stats[cid] = { sent: 0, opens: [], clicks: [] };

    if (type === "open" && email) {
      if (!stats[cid].opens.includes(email.toLowerCase())) {
        stats[cid].opens.push(email.toLowerCase());
      }
      await writeStats(stats);

      // Retourne un pixel 1x1 transparent GIF
      const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
      return new NextResponse(pixel, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (type === "click" && url) {
      if (email) {
        stats[cid].clicks.push({ email: email.toLowerCase(), url, at: new Date().toISOString() });
        await writeStats(stats);
      }
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("Newsletter track error:", err);
  }

  // Fallback pixel
  const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  return new NextResponse(pixel, {
    headers: { "Content-Type": "image/gif" },
  });
}