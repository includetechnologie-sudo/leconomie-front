import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function savePaiement(data: object) {
  try {
    const p = path.join(process.cwd(), "data", "paiements.json");
    const existing = JSON.parse(fs.readFileSync(p, "utf-8"));
    existing.push({ ...data, date: new Date().toISOString() });
    fs.writeFileSync(p, JSON.stringify(existing, null, 2));
  } catch {}
}

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("ref")
    || req.nextUrl.searchParams.get("app_transaction_ref")
    || req.nextUrl.searchParams.get("transaction_ref");

  const status = req.nextUrl.searchParams.get("status")
    || req.nextUrl.searchParams.get("transaction_status");

  const email = req.nextUrl.searchParams.get("email")
    || req.nextUrl.searchParams.get("customer_email")
    || "";

  if (!reference) {
    return NextResponse.redirect(new URL("/abonnement?erreur=reference_manquante", req.url));
  }

  if (status === "success" || status === "completed" || status === "successful") {
    const plan = reference.split("-")[1] || "mensuel";
    const amount = plan === "annuel" ? 50000 : 5000;
    savePaiement({ email, plan, amount, reference });

    const url = new URL("/paiement-succes", req.url);
    url.searchParams.set("ref", reference);
    url.searchParams.set("email", email);
    url.searchParams.set("plan", plan);

    const response = NextResponse.redirect(url);

    const days = plan === "annuel" || plan === "entreprise" ? 365 : 31;
    response.cookies.set("abonne_access", JSON.stringify({ email, plan, ref: reference }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * days,
      path: "/",
    });

    return response;
  }

  return NextResponse.redirect(
    new URL(`/abonnement?erreur=paiement_echoue&ref=${reference}`, req.url)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("MyCoolPay webhook:", JSON.stringify(body, null, 2));

    const status = body.status || body.transaction_status;
    const reference = body.app_transaction_ref || body.transaction_ref;
    const email = body.customer_email || "";

    if ((status === "success" || status === "completed") && reference) {
      const plan = reference.split("-")[1] || "mensuel";
      const days = plan === "annuel" || plan === "entreprise" ? 365 : 31;

      const response = NextResponse.json({ received: true });
      response.cookies.set("abonne_access", JSON.stringify({ email, plan, ref: reference }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * days,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
