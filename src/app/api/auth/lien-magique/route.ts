import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, writeAbonnes } from "@/lib/abonnes";
import { buildAccessCookie, type Plan } from "@/lib/subscription";
import { createMagicLinkToken, consumeMagicLinkToken, sendMagicLinkEmail } from "@/lib/magic-link";

// POST → demande un lien de connexion (crée le compte gratuit si besoin)
export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const abonnes = await readAbonnes();
  let abonne = abonnes.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (!abonne) {
    abonne = {
      email,
      name: email.split("@")[0],
      plan: "gratuit",
      ref: `gratuit-${Date.now()}`,
      expiresAt: 0,
      createdAt: Date.now(),
    };
    abonnes.push(abonne);
    await writeAbonnes(abonnes);
  }

  const token = await createMagicLinkToken(abonne.email);
  await sendMagicLinkEmail(abonne.email, abonne.name || abonne.email.split("@")[0], token);

  return NextResponse.json({ success: true });
}

// GET → consomme le token, connecte l'utilisateur et redirige vers son compte
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/connexion?raison=lien_invalide", req.url));
  }

  const email = await consumeMagicLinkToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/connexion?raison=lien_expire", req.url));
  }

  const abonnes = await readAbonnes();
  const abonne = abonnes.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!abonne) {
    return NextResponse.redirect(new URL("/connexion?raison=session_invalide", req.url));
  }

  const cookieValue = buildAccessCookie(abonne.email, abonne.plan as Plan, abonne.ref, abonne.name);
  const response = NextResponse.redirect(new URL("/mon-compte", req.url));
  response.cookies.set("abonne_access", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
