import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, writeAbonnes } from "@/lib/abonnes";
import { buildAccessCookie } from "@/lib/subscription";
import type { Plan } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { email, name, id, type, titre, ref } = await req.json() as {
      email: string;
      name?: string;
      id: number;
      type: "journal" | "magazine";
      titre: string;
      ref: string;
    };

    if (!email || !id || !type || !ref) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const abonnes = await readAbonnes();
    const idx = abonnes.findIndex((a) => a.email === email);

    const achat = { id, type, titre, ref, acheteLe: Date.now() };

    if (idx >= 0) {
      const existing = abonnes[idx];
      const dejaAchete = existing.achats?.some((a) => a.id === id && a.type === type);
      if (!dejaAchete) {
        existing.achats = [...(existing.achats || []), achat];
        abonnes[idx] = existing;
        await writeAbonnes(abonnes);
      }
      const cookieValue = buildAccessCookie(
        existing.email,
        existing.plan as Plan,
        existing.ref,
        existing.name
      );
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
    const displayName = name || email.split("@")[0];
    const newSubscriber = {
      email,
      name: displayName,
      plan: "gratuit" as Plan,
      ref,
      expiresAt: 0,
      createdAt: Date.now(),
      achats: [achat],
    };
    abonnes.push(newSubscriber);
    await writeAbonnes(abonnes);

    const cookieValue = buildAccessCookie(email, "gratuit", ref, displayName);
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
