import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveSubscriber, sendWelcomeEmailAsync } from "@/lib/abonnes";
import { buildAccessCookie, type Plan } from "@/lib/subscription";
import { sendInvoiceEmail } from "@/lib/invoice-email";

const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

function savePaiement(data: object) {
  try {
    let existing: object[] = [];
    try { existing = JSON.parse(fs.readFileSync(PAIEMENTS_FILE, "utf-8")); } catch {}
    existing.push({ ...data, date: new Date().toISOString() });
    fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(existing, null, 2));
  } catch {}
}

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
      const amount = plan === "annuel" ? 50000 : 5000;

      savePaiement({ email, reference: ref, plan, type: "abonnement", amount });

      sendWelcomeEmailAsync({
        email, name: name || email.split("@")[0],
        plan, ref, expiresAt: result.expiresAt, createdAt: Date.now(),
      });
      Promise.resolve().then(() => sendInvoiceEmail({
        type: "abonnement",
        email,
        name: name || email.split("@")[0],
        plan,
        amount,
        reference: ref,
        expiresAt: result.expiresAt,
      }));
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
