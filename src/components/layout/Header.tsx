import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import HeaderUserMenu from "./HeaderUserMenu";
import HeaderSearch from "./HeaderSearch";
import { parseAccessCookie } from "@/lib/parse-access";

export default async function Header() {
  const cookieStore = await cookies();
  const access = cookieStore.get("abonne_access");

  const user = access ? parseAccessCookie(access.value) : null;

  return (
    <header className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="hidden lg:block">
          <Image
            src="/images/logo.png"
            alt="Leconomie.info"
            width={260}
            height={65}
            priority
          />
        </Link>

        {/* Icônes sociales */}
        <div className="hidden lg:flex items-center gap-4 text-gray-500">
          <a href="https://www.facebook.com/leconomiecmr" target="_blank" rel="noreferrer" aria-label="Facebook"
            className="hover:text-red-600 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          <a href="https://x.com/leconomie_quo" target="_blank" rel="noreferrer" aria-label="X"
            className="hover:text-red-600 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/l-economie-news-tv/posts/?feedView=all" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="hover:text-red-600 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <a href="https://www.youtube.com/@LEconomieTV" target="_blank" rel="noreferrer" aria-label="YouTube"
            className="hover:text-red-600 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
            </svg>
          </a>
        </div>

        {/* Barre de recherche */}
        <HeaderSearch />

        {/* Boutons action */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <HeaderUserMenu name={user.name} email={user.email} />
          ) : (
            <>
              <Link href="/connexion"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Se connecter
              </Link>
              <Link href="/abonnement"
                className="bg-red-600 text-white px-5 py-2 rounded text-sm font-bold hover:bg-red-700 transition flex items-center gap-2">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                S&apos;abonner
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
