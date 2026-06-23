import { cookies } from "next/headers";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_JOURNAUX, GET_MAGAZINES } from "@/graphql/queries";
import type { JournalWP, MagazineWP } from "@/lib/types";
import MagazineTabs from "@/components/magazine/MagazineTabs";

export const metadata = {
  title: "Journal & Magazine",
  description: "Achetez le journal quotidien et le magazine mensuel de L'Économie en version numérique.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info"}/magazine` },
};

export default async function MagazinePage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("abonne_access");
  let isConnected = false;
  let userEmail = "";

  if (accessCookie) {
    try {
      const data = JSON.parse(accessCookie.value) as { user: { email: string } };
      isConnected = true;
      userEmail = data.user?.email || "";
    } catch { /* cookie invalide */ }
  }

  // Récupère journaux et magazines depuis WordPress
  let journaux: JournalWP[] = [];
  let magazines: MagazineWP[] = [];

  try {
    const [jData, mData] = await Promise.all([
      graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX),
      graphqlFetch<{ magazines: { nodes: MagazineWP[] } }>(GET_MAGAZINES),
    ]);
    journaux = jData.journaux.nodes;
    magazines = mData.magazines.nodes;
  } catch { /* silence */ }

  // Convertit au format attendu par MagazineTabs
  const quotidiens = journaux.map((j) => ({
    id: String(j.databaseId),
    num: j.numero ? `N° ${j.numero}` : j.title,
    date: j.datePublication || "",
    titre: j.title,
    description: j.extrait || "",
    extrait: j.extrait || "",
    cover: j.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg",
    prix: 300,
  }));

  const magazinesList = magazines.map((m) => ({
    id: String(m.databaseId),
    num: m.numero ? `N° ${m.numero}` : m.title,
    date: m.datePublication || "",
    titre: m.title,
    description: m.extrait || "",
    extrait: m.extrait || "",
    sommaire: m.sommaire ? m.sommaire.split("\n").filter(Boolean) : [],
    cover: m.featuredImage?.node?.sourceUrl || "/images/magazine-cover.jpg",
    prix: 3000,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <h1 className="font-serif text-3xl font-bold mb-2">Publications</h1>
          <div className="w-12 h-1 bg-red-600 mx-auto rounded" />
        </div>
      </div>

      <MagazineTabs
        quotidiens={quotidiens}
        magazines={magazinesList}
        isConnected={isConnected}
        userEmail={userEmail}
      />
    </div>
  );
}
