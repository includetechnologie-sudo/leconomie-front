import { NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/invoice-email";

export async function GET() {
  try {
    await sendInvoiceEmail({
      type: "abonnement",
      email: "josephelvisbengonozang@gmail.com",
      name: "Joseph Elvis",
      plan: "mensuel",
      amount: 5000,
      reference: "leco-test-facture-001",
      expiresAt: Date.now() + 31 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({ success: true, message: "Facture test envoyée à josephelvisbengonozang@gmail.com" });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}