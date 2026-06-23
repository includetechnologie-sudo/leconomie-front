import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "push-subscriptions.json");

function readSubscriptions(): object[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch { return []; }
}

function writeSubscriptions(subs: object[]) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(subs, null, 2));
}

// POST — enregistre une subscription
export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Subscription invalide" }, { status: 400 });
    }
    const subs = readSubscriptions() as { endpoint: string }[];
    const exists = subs.find((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      subs.push(subscription);
      writeSubscriptions(subs);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — supprime une subscription (désabonnement)
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    const subs = readSubscriptions() as { endpoint: string }[];
    const filtered = subs.filter((s) => s.endpoint !== endpoint);
    writeSubscriptions(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
