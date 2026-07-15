import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, plan, amount, currency } = await req.json();

    if (!email || !name || !plan || !amount) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const reference = `leco-${plan}-${Date.now()}`;
    const callbackUrl = process.env.NOTCHPAY_CALLBACK_URL || `${req.nextUrl.origin}/api/notchpay/callback`;
    const successUrl = `${req.nextUrl.origin}/paiement-succes?ref=${reference}&email=${encodeURIComponent(email)}&plan=${plan}`;

    const body = {
      email,
      amount,
      currency: currency || "XAF",
      description: `Abonnement L'Economie – Plan ${plan}`,
      reference,
      callback: callbackUrl,
      success_url: successUrl,
      customer: { name, email },
    };

    const res = await fetch("https://api.notchpay.co/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Notchpay response:", JSON.stringify(data, null, 2));

    // L'URL peut être à la racine ou dans data.transaction selon la version de l'API
    const authUrl = data.authorization_url || data.transaction?.authorization_url;

    if (!res.ok || !authUrl) {
      console.error("Notchpay error:", data);
      return NextResponse.json(
        { error: data.message || "Erreur Notchpay lors de l'initialisation." },
        { status: 500 }
      );
    }

    return NextResponse.json({ authorization_url: authUrl });
  } catch (err) {
    console.error("Initier paiement error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
