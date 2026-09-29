import { NextResponse } from "next/server";
import { getBvmacSessions, nomUsuel, paysValeur } from "@/lib/bvmac";

// Dernière séance BVMAC, allégée pour le panneau « Bourse » du menu
export async function GET() {
  const [last] = getBvmacSessions();
  if (!last) return NextResponse.json({ session: null });

  return NextResponse.json(
    {
      session: {
        date: last.date,
        numero: last.numero,
        pdfUrl: last.pdfUrl,
        indice: last.indice,
        actions: last.actions.map((a) => ({
          isin: a.isin,
          nom: nomUsuel(a),
          pays: paysValeur(a),
          cours: a.cours,
          variationPct: a.variationPct,
        })),
      },
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
  );
}
