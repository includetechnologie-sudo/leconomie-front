import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkDashboardAuth } from "@/lib/dashboard-auth";

const CORRECTIF_FILE = path.join(process.cwd(), "data", "solde-correctif.json");
const RETRAITS_FILE = path.join(process.cwd(), "data", "retraits.json");
const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

function readJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

// Recalcule les revenus nets à partir des paiements (même logique que /api/dashboard/stats)
function computeRevenus(): number {
  const paiements: { amount?: number; type?: string; plan?: string; paymentMethod?: string }[] = readJSON(PAIEMENTS_FILE, []);
  return paiements.reduce((sum, p) => {
    const brut = p.amount || 0;
    if (brut === 0) return sum;
    let commission: number;
    if (p.paymentMethod === "card") commission = 0.04;
    else if (p.paymentMethod === "mobile") commission = 0.02;
    else commission = (p.type === "abonnement" || p.plan === "mensuel" || p.plan === "annuel") ? 0.04 : 0.02;
    return sum + Math.round(brut * (1 - commission));
  }, 0);
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { soldeReel } = await req.json();
    if (typeof soldeReel !== "number") {
      return NextResponse.json({ error: "Paramètre soldeReel manquant" }, { status: 400 });
    }

    const retraits: { net?: number }[] = readJSON(RETRAITS_FILE, []);
    const totalRetire = retraits.reduce((s, r) => s + (r.net || 0), 0);
    const base = computeRevenus() - totalRetire;
    const valeur = soldeReel - base;

    fs.writeFileSync(CORRECTIF_FILE, JSON.stringify({ valeur }, null, 2));

    return NextResponse.json({ success: true, soldeDisponible: base + valeur });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
