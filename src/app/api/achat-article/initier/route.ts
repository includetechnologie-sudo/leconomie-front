import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PENDING_FILE = path.join(process.cwd(), "data", "achats-pending.json");

async function savePending(ref: string, email: string, slug: string, titre?: string) {
  let pending: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf-8");
    pending = JSON.parse(raw);
  } catch {}
  pending[ref] = { email, slug, titre, type: "article" };
  await fs.mkdir(path.dirname(PENDING_FILE), { recursive: true });
  await fs.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, slug, titre, paymentMethod } = await req.json();

    const isCard = paymentMethod === "card";

    if (!email || !slug) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }
    if (!isCard && !phone) {
      return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
    }

    const reference = `leco-art-${Date.now()}`;
    const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY!;

    const body: Record<string, unknown> = {
      transaction_amount: 200,
      transaction_currency: "XAF",
      transaction_reason: titre ? `Achat article – ${titre}` : `Achat article L'Economie (48h)`,
      app_transaction_ref: reference,
      customer_name: name || email.split("@")[0],
      customer_email: email,
      customer_lang: "fr",
    };

    if (!isCard) {
      const digits = phone.replace(/\D/g, "");
      body.customer_phone_number = digits;
    }

    const res = await fetch(`https://my-coolpay.com/api/${publicKey}/paylink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.MYCOOLPAY_PRIVATE_KEY!}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const paymentUrl = data.payment_url || data.link || data.url || data.data?.payment_url;

    if (!res.ok || !paymentUrl) {
      const errMsg = data.message || data.error || JSON.stringify(data);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    await savePending(reference, email, slug, titre);

    return NextResponse.json({ authorization_url: paymentUrl, reference });
  } catch (err) {
    console.error("Achat article initier error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}