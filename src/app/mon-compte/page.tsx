import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_JOURNAUX, GET_MAGAZINES } from "@/graphql/queries";
import type { JournalWP, MagazineWP } from "@/lib/types";
import { parseAccessCookie } from "@/lib/parse-access";
import MonCompteClient from "./MonCompteClient";

export default async function MonComptePage() {
  const cookieStore = await cookies();
  const access = cookieStore.get("abonne_access");

  if (!access) redirect("/connexion?raison=acces_reserve");

  const user = parseAccessCookie(access.value);
  if (!user) redirect("/connexion?raison=session_invalide");

  // Récupère les journaux et magazines depuis WordPress
  let journaux: JournalWP[] = [];
  let magazines: MagazineWP[] = [];

  try {
    const [jData, mData] = await Promise.all([
      graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX),
      graphqlFetch<{ magazines: { nodes: MagazineWP[] } }>(GET_MAGAZINES),
    ]);
    journaux = jData.journaux.nodes;
    magazines = mData.magazines.nodes;
  } catch { /* silence — affiche liste vide si WordPress indisponible */ }

  return <MonCompteClient user={user!} journaux={journaux} magazines={magazines} />;
}
