import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql-fetch";

const GET_PDF_URL = `
  query GetPdfUrl($id: ID!) {
    journal: journal(id: $id, idType: DATABASE_ID) { pdfUrl title }
    magazine: magazine(id: $id, idType: DATABASE_ID) { pdfUrl title }
  }
`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Vérification du cookie abonné
  const access = req.cookies.get("abonne_access");
  if (!access) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    JSON.parse(access.value);
  } catch {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  // Bloque les requêtes venant d'un site externe (pas du même domaine)
  const referer = req.headers.get("referer") || "";
  if (referer && !referer.includes("localhost") && !referer.includes("leconomie.info")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Récupère l'URL du PDF depuis WordPress (id = databaseId)
  let pdfUrl: string | null = null;
  try {
    const data = await graphqlFetch<{
      journal?: { pdfUrl: string; title: string } | null;
      magazine?: { pdfUrl: string; title: string } | null;
    }>(GET_PDF_URL, { id });
    pdfUrl = data.journal?.pdfUrl || data.magazine?.pdfUrl || null;
  } catch {
    return NextResponse.json({ error: "Erreur GraphQL" }, { status: 500 });
  }

  if (!pdfUrl) {
    return NextResponse.json({ error: "PDF introuvable" }, { status: 404 });
  }

  // Proxy sécurisé — l'URL réelle du PDF n'est jamais exposée au client
  try {
    const pdfRes = await fetch(pdfUrl, {
      headers: { "User-Agent": "LeconomieApp/1.0" },
    });
    if (!pdfRes.ok) {
      return NextResponse.json({ error: "Fichier PDF introuvable sur le serveur" }, { status: 404 });
    }
    const buffer = await pdfRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
