import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, plan, amount } = await req.json();

    if (!email || !name || !phone || !plan || !amount) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const reference = `leco-${plan}-${Date.now()}`;
    const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY!;

    // MyCoolPay requiert le format international sans + : 237XXXXXXXXX
    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("237") ? digits : `237${digits}`;

    const body = {
      transaction_amount: amount,
      transaction_currency: "XAF",
      transaction_reason: `Abonnement L'Economie – Plan ${plan}`,
      app_transaction_ref: reference,
      customer_phone_number: formattedPhone,
      customer_name: name,
      customer_email: email,
      customer_lang: "fr",
    };

    const res = await fetch(`https://my-coolpay.com/api/${publicKey}/paylink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.MYCOOLPAY_PRIVATE_KEY!}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("MyCoolPay status:", res.status);
    console.log("MyCoolPay response:", JSON.stringify(data, null, 2));

    const paymentUrl = data.payment_url || data.link || data.url || data.data?.payment_url;

    if (!res.ok || !paymentUrl) {
      const errMsg = data.message || data.error || data.errors
        || JSON.stringify(data);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ authorization_url: paymentUrl });
  } catch (err) {
    console.error("Initier paiement error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
