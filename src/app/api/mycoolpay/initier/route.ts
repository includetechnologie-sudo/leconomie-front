import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PENDING_FILE = path.join(process.cwd(), "data", "achats-pending.json");

async function savePendingAbonnement(ref: string, email: string, name: string, plan: string) {
  try {
    let pending: Record<string, unknown> = {};
    try {
      const raw = await fs.readFile(PENDING_FILE, "utf-8");
      pending = JSON.parse(raw);
    } catch { /* fichier absent au 1er run */ }
    pending[ref] = { email, name, plan, type: "abonnement" };
    await fs.mkdir(path.dirname(PENDING_FILE), { recursive: true });
    await fs.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error("savePendingAbonnement error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, plan, amount, paymentMethod } = await req.json();

    const isCard = paymentMethod === "card";

    if (!email || !name || !plan || !amount) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }
    if (!isCard && !phone) {
      return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
    }

    const reference = `leco-${plan}-${Date.now()}`;
    const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY!;

    const body: Record<string, unknown> = {
      transaction_amount: amount,
      transaction_currency: "XAF",
      transaction_reason: `Abonnement L'Economie – Plan ${plan}`,
      app_transaction_ref: reference,
      customer_name: name,
      customer_email: email,
      customer_lang: "fr",
    };

    if (isCard) {
      body.payment_channel = "card";
    } else {
      const digits = phone.replace(/\D/g, "");
      body.customer_phone_number = digits;
    }

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

    // Sauvegarde en pending pour que le callback puisse retrouver l'abonnement
    await savePendingAbonnement(reference, email, name, plan);

    return NextResponse.json({ authorization_url: paymentUrl });
  } catch (err) {
    console.error("Initier paiement error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
