import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, id, type, titre, amount } = await req.json() as {
      email: string;
      name: string;
      phone: string;
      id: number;
      type: "journal" | "magazine";
      titre: string;
      amount: number;
    };

    if (!email || !name || !phone || !id || !type || !amount) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    // Référence qui encode l'achat unitaire : leco-achat-{id}-{type}-{timestamp}
    const reference = `leco-achat-${id}-${type}-${Date.now()}`;
    const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY!;

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("237") ? digits : `237${digits}`;

    const body = {
      transaction_amount: amount,
      transaction_currency: "XAF",
      transaction_reason: `Achat numéro – ${titre}`,
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
    const paymentUrl = data.payment_url || data.link || data.url || data.data?.payment_url;

    if (!res.ok || !paymentUrl) {
      return NextResponse.json({ error: data.message || data.error || JSON.stringify(data) }, { status: 500 });
    }

    return NextResponse.json({ authorization_url: paymentUrl });
  } catch (err) {
    console.error("Initier achat error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
