import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber, sendWelcomeEmailAsync } from "@/lib/abonnes";
import type { Plan } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { email, name, plan, ref } = await req.json() as {
      email: string; name: string; plan: Plan; ref: string;
    };

    if (!email || !plan || !ref) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const result = await saveSubscriber(email, name, plan, ref);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    sendWelcomeEmailAsync({
      email, name: name || email.split("@")[0], plan, ref,
      expiresAt: result.expiresAt, createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, expiresAt: result.expiresAt, hasPassword: result.hasPassword });
  } catch (err) {
    console.error("Enregistrer abonné error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
