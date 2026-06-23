import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/abonnement?erreur=reference_manquante", req.url));
  }

  try {
    const res = await fetch(`https://api.notchpay.co/payments/${reference}`, {
      headers: {
        "Authorization": process.env.NOTCHPAY_SECRET_KEY!,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    const status = data.transaction?.status;

    if (status === "complete" || status === "successful") {
      const email = data.transaction?.customer?.email || "";
      const plan = reference.split("-")[1] || "mensuel";

      const url = new URL("/paiement-succes", req.url);
      url.searchParams.set("ref", reference);
      url.searchParams.set("email", email);
      url.searchParams.set("plan", plan);

      const response = NextResponse.redirect(url);

      // Cookie d'accès abonné (durée selon le plan)
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

    return NextResponse.redirect(new URL(`/abonnement?erreur=paiement_echoue&ref=${reference}`, req.url));
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(new URL("/abonnement?erreur=erreur_serveur", req.url));
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
