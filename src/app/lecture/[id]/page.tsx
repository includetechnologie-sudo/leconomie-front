import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import PdfViewer from "@/components/lecture/PdfViewer";

const GET_EDITION = `
  query GetEdition($id: ID!) {
    journal: journal(id: $id, idType: DATABASE_ID) {
      title numero datePublication pdfUrl
      featuredImage { node { sourceUrl } }
    }
    magazine: magazine(id: $id, idType: DATABASE_ID) {
      title numero datePublication pdfUrl
      featuredImage { node { sourceUrl } }
    }
  }
`;

export default async function LectureViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Vérification accès
  const cookieStore = await cookies();
  const access = cookieStore.get("abonne_access");
  if (!access) redirect("/connexion?raison=acces_reserve");
  try { JSON.parse(access.value); } catch { redirect("/connexion?raison=session_invalide"); }

  // Récupère les infos depuis WordPress
  let titre = "";
  let numero = "";
  let datePubli = "";

  try {
    const data = await graphqlFetch<{
      journal?: { title: string; numero: string; datePublication: string; pdfUrl: string } | null;
      magazine?: { title: string; numero: string; datePublication: string; pdfUrl: string } | null;
    }>(GET_EDITION, { id });
    const item = data.journal || data.magazine;
    if (!item) redirect("/mon-compte");
    titre = item.title;
    numero = item.numero ? `N° ${item.numero}` : "";
    datePubli = item.datePublication || "";
  } catch {
    redirect("/mon-compte");
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Barre top */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/mon-compte#journaux"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour
          </Link>
          <div className="w-px h-4 bg-gray-700" />
          <div>
            {numero && <span className="text-xs text-red-400 font-bold">{numero}</span>}
            <p className="text-sm font-semibold text-white truncate max-w-[400px]">{titre}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {datePubli && <span className="text-xs text-gray-400">{datePubli}</span>}
          <a
            href="https://wa.me/237693537690"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-bold px-3 py-1.5 rounded transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Support
          </a>
        </div>
      </div>

      {/* Visionneuse PDF */}
      <div className="flex-1">
        <PdfViewer pdfUrl={`/api/pdf/${id}`} />
      </div>

    </div>
  );
}
