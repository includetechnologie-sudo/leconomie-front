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

    const fixes = [
      { email: "hkemayou2504.hk@gmail.com", plan: "annuel", amount: 50000, paymentMethod: "mobile" },
      { email: "biloaaristide10@gmail.com", plan: "mensuel", amount: 5000, paymentMethod: "mobile" },
    ];

    let updated = 0;
    for (const fix of fixes) {
      const idx = paiements.findIndex(
        (p) => p.email === fix.email && p.plan === fix.plan
      );
      if (idx >= 0) {
        paiements[idx].amount = fix.amount;
        paiements[idx].paymentMethod = fix.paymentMethod;
        updated++;
      } else {
        paiements.push({
          email: fix.email,
          plan: fix.plan,
          type: "abonnement",
          amount: fix.amount,
          paymentMethod: fix.paymentMethod,
          date: fix.plan === "annuel" ? "2026-08-16T00:00:00.000Z" : "2026-07-29T00:00:00.000Z",
        });
        updated++;
      }
    }

    if (updated > 0) {
      fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(paiements, null, 2));
    }

    return NextResponse.json({
      success: true,
      updated,
      totalPaiements: paiements.length,
      message: updated > 0
        ? `${updated} paiement(s) mis à jour avec montant`
        : "Tous les paiements ont déjà un montant",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}