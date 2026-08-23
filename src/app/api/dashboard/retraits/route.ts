import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkDashboardAuth } from "@/lib/dashboard-auth";

const RETRAITS_FILE = path.join(process.cwd(), "data", "retraits.json");

interface Retrait {
  montant: number;
  frais: number;
  net: number;
  beneficiaire: string;
  banque: string;
  motif: string;
  date: string;
  statut: string;
}

function readRetraits(): Retrait[] {
  try {
    return JSON.parse(fs.readFileSync(RETRAITS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeRetraits(data: Retrait[]) {
  fs.writeFileSync(RETRAITS_FILE, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({ retraits: readRetraits() });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { montant, frais, beneficiaire, banque, motif, date, statut } = body;

    if (!montant || !beneficiaire) {
      return NextResponse.json({ error: "Montant et bénéficiaire requis" }, { status: 400 });
    }

    const retrait: Retrait = {
      montant: Number(montant),
      frais: Number(frais) || 0,
      net: Number(montant) + Number(frais || 0),
      beneficiaire,
      banque: banque || "",
      motif: motif || "",
      date: date || new Date().toISOString(),
      statut: statut || "effectué",
    };

    const retraits = readRetraits();
    retraits.push(retrait);
    writeRetraits(retraits);

    return NextResponse.json({ success: true, retrait });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}