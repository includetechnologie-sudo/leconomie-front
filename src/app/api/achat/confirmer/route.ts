import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, writeAbonnes } from "@/lib/abonnes";
import { buildAccessCookie } from "@/lib/subscription";
import type { Plan } from "@/lib/subscription";
import { promises as fs } from "fs";
import path from "path";

const PENDING_FILE = path.join(process.cwd(), "data", "achats-pending.json");

async function resolvePending(ref: string): Promise<{ email: string; name: string; id: number; type: "journal" | "magazine"; titre: string } | null> {
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf-8");
    const pending = JSON.parse(raw);
    return pending[ref] || null;
  } catch {
    return null;
  }
}

async function deletePending(ref: string) {
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf-8");
    const pending = JSON.parse(raw);
    delete pending[ref];
    await fs.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
  } catch { /* ignore */ }
}

export async function POST(req: NextRequest) {
  try {
    let { email, name, id, type, titre, ref } = await req.json() as {
      email?: string;
      name?: string;
      id?: number;
      type?: "journal" | "magazine";
      titre?: string;
      ref: string;
    };

    if (!ref) {
      return NextResponse.json({ error: "Référence manquante." }, { status: 400 });
    }

    // Si email ou infos manquants, on les récupère depuis le fichier pending
    if (!email || !id || !type) {
      const pending = await resolvePending(ref);
      if (pending) {
        email = email || pending.email;
        name = name || pending.name;
        id = id || pending.id;
        type = type || pending.type;
        titre = titre || pending.titre;
      }
    }

    if (!email || !id || !type) {
      return NextResponse.json({ error: "Informations d'achat introuvables." }, { status: 400 });
    }

    const abonnes = await readAbonnes();
    const idx = abonnes.findIndex((a) => a.email === email);

    const achat = { id, type, titre: titre || `Numéro ${id}`, ref, acheteLe: Date.now() };

    if (idx >= 0) {
      const existing = abonnes[idx];
      const dejaAchete = existing.achats?.some((a) => a.id === id && a.type === type);
      if (!dejaAchete) {
        existing.achats = [...(existing.achats || []), achat];
        abonnes[idx] = existing;
        await writeAbonnes(abonnes);
      }
      await deletePending(ref);

      const cookieValue = buildAccessCookie(existing.email, existing.plan as Plan, existing.ref, existing.name);
      const response = NextResponse.json({ success: true, hasPassword: !!existing.passwordHash });
      response.cookies.set("abonne_access", cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      return response;
    }

    // Nouveau compte gratuit
    const displayName = name || email!.split("@")[0];
    const newSubscriber = {
      email: email!,
      name: displayName,
      plan: "gratuit" as Plan,
      ref,
      expiresAt: 0,
      createdAt: Date.now(),
      achats: [achat],
    };
    abonnes.push(newSubscriber);
    await writeAbonnes(abonnes);
    await deletePending(ref);

    const cookieValue = buildAccessCookie(email!, "gratuit", ref, displayName);
    const response = NextResponse.json({ success: true, hasPassword: false });
    response.cookies.set("abonne_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Achat confirmer error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
