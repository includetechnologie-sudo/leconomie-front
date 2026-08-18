import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

export async function GET() {
  try {
    let paiements: Record<string, unknown>[] = [];
    try {
      paiements = JSON.parse(fs.readFileSync(PAIEMENTS_FILE, "utf-8"));
    } catch {}

    const toAdd = [
      {
        email: "hkemayou2504.hk@gmail.com",
        name: "Henri KEMAYOU",
        reference: "backfill-annuel-henri",
        plan: "annuel",
        type: "abonnement",
        amount: 50000,
        paymentMethod: "mobile",
        date: "2026-08-16T00:00:00.000Z",
      },
      {
        email: "biloaaristide10@gmail.com",
        name: "JEAN ESSIMI",
        reference: "backfill-mensuel-jean",
        plan: "mensuel",
        type: "abonnement",
        amount: 5000,
        paymentMethod: "mobile",
        date: "2026-07-29T00:00:00.000Z",
      },
    ];

    let added = 0;
    for (const entry of toAdd) {
      const exists = paiements.some(
        (p) => p.email === entry.email && p.type === "abonnement" && p.plan === entry.plan
      );
      if (!exists) {
        paiements.push(entry);
        added++;
      }
    }

    if (added > 0) {
      fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(paiements, null, 2));
    }

    return NextResponse.json({
      success: true,
      added,
      message: added > 0
        ? `${added} paiement(s) ajouté(s) avec succès`
        : "Les paiements existent déjà, rien à ajouter",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}