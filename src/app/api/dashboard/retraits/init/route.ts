import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RETRAITS_FILE = path.join(process.cwd(), "data", "retraits.json");

export async function GET() {
  try {
    let retraits: object[] = [];
    try {
      retraits = JSON.parse(fs.readFileSync(RETRAITS_FILE, "utf-8"));
    } catch {}

    if (retraits.length === 0) {
      retraits.push({
        montant: 55000,
        frais: 5000,
        net: 60000,
        beneficiaire: "L'ECONOMIE MEDIAS GROUP SARL",
        banque: "AFRILAND FIRST BANK",
        motif: "retrait des recettes du mois",
        date: "2026-08-21T11:09:00.000Z",
        statut: "planifié",
      });
      fs.writeFileSync(RETRAITS_FILE, JSON.stringify(retraits, null, 2));
      return NextResponse.json({ success: true, message: "Retrait initial ajouté" });
    }

    return NextResponse.json({ success: true, message: "Retraits déjà initialisés", count: retraits.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}