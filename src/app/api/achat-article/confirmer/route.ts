import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ACHATS_FILE = path.join(process.cwd(), "data", "achats-articles.json");
const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

interface AchatArticle {
  email: string;
  slug: string;
  purchasedAt: string;
  reference: string;
  expiresAt: string;
}

function readAchats(): AchatArticle[] {
  try {
    return JSON.parse(fs.readFileSync(ACHATS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveAchat(achat: AchatArticle) {
  const achats = readAchats();
  achats.push(achat);
  fs.writeFileSync(ACHATS_FILE, JSON.stringify(achats, null, 2));
}

function savePaiement(data: object) {
  try {
    let existing: object[] = [];
    try { existing = JSON.parse(fs.readFileSync(PAIEMENTS_FILE, "utf-8")); } catch {}
    existing.push({ ...data, date: new Date().toISOString() });
    fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(existing, null, 2));
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { email, slug, ref } = await req.json();

    if (!email || !slug || !ref) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    saveAchat({
      email,
      slug,
      purchasedAt: now.toISOString(),
      reference: ref,
      expiresAt: expiresAt.toISOString(),
    });

    savePaiement({
      email,
      reference: ref,
      type: "achat-article",
      slug,
      amount: 200,
    });

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Achat article confirmer error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}