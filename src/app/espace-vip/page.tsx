import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_PREMIUM_POSTS, GET_JOURNAUX, GET_MAGAZINES } from "@/graphql/queries";
import { parseAccessCookie, canAccess } from "@/lib/subscription";
import type { JournalWP } from "@/lib/types";
import EspaceVipTabs from "./EspaceVipTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace VIP",
  description: "Accédez aux articles premium, au journal et au magazine de L'Economie.",
};

interface PremiumPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

interface MagazineWP {
  id: string;
  databaseId: number;
  title: string;
  numero?: string;
  datePublication?: string;
  pdfUrl?: string;
  sommaire?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}

export default async function EspaceVipPage() {
  const cookieStore = await cookies();
  const access = cookieStore.get("abonne_access");

  if (!access) {
    redirect("/connexion?raison=acces_reserve");
  }

  const user = parseAccessCookie(access.value);
  if (!user || user.isExpired) {
    redirect("/connexion?raison=session_expiree");
  }

  const hasPremium = canAccess(user.plan, "premium");
  if (!hasPremium) {
    redirect("/abonnement?raison=pas_premium");
  }

  let premiumPosts: PremiumPost[] = [];
  let journaux: JournalWP[] = [];
  let magazines: MagazineWP[] = [];

  try {
    const [postsData, journauxData, magazinesData] = await Promise.all([
      graphqlFetch<{ posts: { nodes: PremiumPost[] } }>(GET_PREMIUM_POSTS),
      graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX),
      graphqlFetch<{ magazines: { nodes: MagazineWP[] } }>(GET_MAGAZINES),
    ]);
    premiumPosts = postsData.posts?.nodes || [];
    journaux = journauxData.journaux?.nodes || [];
    magazines = magazinesData.magazines?.nodes || [];
  } catch {}

  return (
    <div className="min-h-screen">
      {/* En-tête VIP */}
      <div className="bg-[#c9a84c] py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="28" height="28" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="font-serif text-3xl font-bold text-black">Espace VIP</h1>
          </div>
          <p className="text-black/70 text-sm">
            Bienvenue <strong className="text-black">{user.name}</strong> — Accédez à tout le contenu premium
          </p>
        </div>
      </div>

      {/* Contenu avec onglets */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EspaceVipTabs
          premiumPosts={premiumPosts}
          journaux={journaux}
          magazines={magazines}
        />
      </div>
    </div>
  );
}