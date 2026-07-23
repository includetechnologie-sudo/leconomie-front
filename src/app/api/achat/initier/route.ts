import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PENDING_FILE = path.join(process.cwd(), "data", "achats-pending.json");

async function savePending(ref: string, data: object) {
  let pending: Record<string, object> = {};
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf-8");
    pending = JSON.parse(raw);
  } catch { /* fichier inexistant, on repart de zéro */ }
  pending[ref] = data;
  await fs.mkdir(path.dirname(PENDING_FILE), { recursive: true });
  await fs.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, id, type, titre, amount, paymentMethod } = await req.json() as {
      email: string;
      name: string;
      phone: string;
      id: number;
      type: "journal" | "magazine";
      titre: string;
      amount: number;
      paymentMethod?: "mobile" | "card";
    };

    const isCard = paymentMethod === "card";

    if (!email || !name || !id || !type || !amount) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }
    if (!isCard && !phone) {
      return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
    }

    const reference = `leco-achat-${id}-${type}-${Date.now()}`;
    const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY!;

    // Sauvegarde l'intention d'achat pour retrouver email/infos au retour
    await savePending(reference, { email, name, id, type, titre });

    const body: Record<string, unknown> = {
      transaction_amount: amount,
      transaction_currency: "XAF",
      transaction_reason: `Achat numéro – ${titre}`,
      app_transaction_ref: reference,
      customer_name: name,
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
