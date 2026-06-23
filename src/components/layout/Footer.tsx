import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Économie", href: "/economie" },
  { label: "Finance", href: "/finance" },
  { label: "CEMAC", href: "/cemac" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Magazine", href: "/magazine" },
];

const resourceLinks = [
  { label: "Abonnement", href: "/abonnement" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Publicité", href: "/publicite" },
  { label: "Contact", href: "/contact" },
  { label: "Mentions légales", href: "/mentions-legales" },
];

const infoLinks = [
  { label: "À propos", href: "/a-propos" },
  { label: "CGU", href: "/cgu" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Politique éditoriale", href: "/politique-editoriale" },
];

const rubriquesLinks = [
  { label: "Décideur", href: "/decideur" },
  { label: "Opinion", href: "/opinion" },
  { label: "Interview", href: "/interview" },
  { label: "Événement", href: "/evenement" },
  { label: "Magazine", href: "/magazine" },
];

const socialIcons = [
  { label: "Facebook", href: "https://www.facebook.com/leconomiecmr", d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "X", href: "https://x.com/leconomie_quo", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/l-economie-news-tv/posts/?feedView=all", d: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" },
  { label: "YouTube", href: "https://www.youtube.com/@LEconomieTV", d: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Logo + description + réseaux */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Leconomie.info"
                width={160}
                height={40}
                className="brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
              Le Premier quotidien économique de la zone Cemac
            </p>
            <div className="flex gap-3 mt-4">
              {socialIcons.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.d}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-4">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-300 hover:text-red-500 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rubriques */}
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-4">Rubriques</h4>
            <ul className="space-y-2">
              {rubriquesLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-300 hover:text-red-500 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-4">Ressources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-300 hover:text-red-500 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Recevez chaque jour l&apos;essentiel de l&apos;actualité économique.
            </p>
            <NewsletterForm variant="footer" />
          </div>

        </div>
      </div>

      {/* Barre de bas de page */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© 2026 Leconomie.info – Tous droits réservés</span>
          <div className="flex gap-4 flex-wrap justify-center">
            {infoLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gray-300 transition">{l.label}</Link>
            ))}
          </div>
          <span>
            Built by{" "}
            <a
              href="https://www.includetechnologie.fr"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-red-500 transition font-medium"
            >
              Include Technologie
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
