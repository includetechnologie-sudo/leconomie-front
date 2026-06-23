import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/password";

const DATA_FILE = path.join(process.cwd(), "data", "abonnes.json");

interface Subscriber {
  email: string;
  name: string;
  plan: string;
  ref: string;
  expiresAt: number;
  createdAt: number;
  passwordHash?: string;
}

async function readAbonnes(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAbonnes(list: Subscriber[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

export async function POST(req: NextRequest) {
  const { email, password, token } = await req.json();

  if (!email || !password || !token) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
  }

  // Vérifie le token (= la référence de paiement stockée en cookie)
  const abonnes = await readAbonnes();
  const idx = abonnes.findIndex((a) => a.email === email && a.ref === token);

  if (idx < 0) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 404 });
  }

  if (abonnes[idx].passwordHash) {
    return NextResponse.json({ error: "Un mot de passe existe déjà pour ce compte. Connectez-vous." }, { status: 409 });
  }

  abonnes[idx].passwordHash = await hashPassword(password);
  await writeAbonnes(abonnes);

  return NextResponse.json({ success: true });
}
