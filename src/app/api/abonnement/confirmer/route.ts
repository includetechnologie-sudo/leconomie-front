import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber, sendWelcomeEmailAsync } from "@/lib/abonnes";
import { buildAccessCookie, type Plan } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { email, name, plan, ref } = await req.json() as {
      email: string; name: string; plan: Plan; ref: string;
    };

    if (!email || !plan || !ref) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const result = await saveSubscriber(email, name, plan, ref);

    if (result.success) {
      sendWelcomeEmailAsync({
        email, name: name || email.split("@")[0],
        plan, ref, expiresAt: result.expiresAt, createdAt: Date.now(),
      });
    }

    const days = plan === "annuel" ? 365 : 31;
    const cookieValue = buildAccessCookie(email, plan, ref, name);

    const response = NextResponse.json({
      success: true,
      hasPassword: result.hasPassword,
      expiresAt: result.expiresAt,
    });

    response.cookies.set("abonne_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * days,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Confirmer paiement error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
