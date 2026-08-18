import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendInvoiceEmail } from "@/lib/invoice-email";

const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

export async function GET() {
  try {
    const reference = "leco-test-facture-001";

    // Sauvegarder le paiement test dans paiements.json
    let paiements: Record<string, unknown>[] = [];
    try {
      paiements = JSON.parse(fs.readFileSync(PAIEMENTS_FILE, "utf-8"));
    } catch { /* fichier absent */ }

    const exists = paiements.some((p) => p.reference === reference);
    if (!exists) {
      paiements.push({
        email: "josephelvisbengonozang@gmail.com",
        name: "Joseph Elvis",
        reference,
        plan: "mensuel",
        type: "abonnement",
        amount: 5000,
        date: new Date().toISOString(),
      });
      fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(paiements, null, 2));
    }

    await sendInvoiceEmail({
      type: "abonnement",
      email: "josephelvisbengonozang@gmail.com",
      name: "Joseph Elvis",
      plan: "mensuel",
      amount: 5000,
      reference,
      expiresAt: Date.now() + 31 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({ success: true, message: "Facture test envoyée à josephelvisbengonozang@gmail.com" });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}