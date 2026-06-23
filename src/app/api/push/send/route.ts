import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "push-subscriptions.json");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function readSubscriptions() {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch { return []; }
}

export async function POST(req: NextRequest) {
  // Sécurité — clé secrète pour que seul WordPress puisse déclencher
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { title, body, url, image, tag } = await req.json();
  const payload = JSON.stringify({ title, body, url, image, tag });

  const subscriptions = readSubscriptions();
  const dead: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub: { endpoint: string }) => {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, payload);
        sent++;
      } catch (err: unknown) {
        // Subscription expirée — on la supprime
        if (err && typeof err === "object" && "statusCode" in err) {
          const code = (err as { statusCode: number }).statusCode;
          if (code === 404 || code === 410) dead.push(sub.endpoint);
        }
      }
    })
  );

  // Nettoie les subscriptions mortes
  if (dead.length > 0) {
    const all = readSubscriptions() as { endpoint: string }[];
    const cleaned = all.filter((s) => !dead.includes(s.endpoint));
    fs.writeFileSync(DB_PATH, JSON.stringify(cleaned, null, 2));
  }

  return NextResponse.json({ sent, dead: dead.length, total: subscriptions.length });
}
