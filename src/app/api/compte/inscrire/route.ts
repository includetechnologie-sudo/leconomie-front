import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, writeAbonnes } from "@/lib/abonnes";
import { hashPassword } from "@/lib/password";
import { buildAccessCookie } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const abonnes = await readAbonnes();
    const existing = abonnes.find((a) => a.email === email);

    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email. Connectez-vous." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const ref = `gratuit-${Date.now()}`;
    const now = Date.now();

    abonnes.push({
      email,
      name,
      plan: "gratuit",
      ref,
      expiresAt: 0,
      createdAt: now,
      passwordHash,
    });

    await writeAbonnes(abonnes);

    const cookieValue = buildAccessCookie(email, "gratuit", ref, name);
    const response = NextResponse.json({ success: true });

    response.cookies.set("abonne_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Inscription error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
