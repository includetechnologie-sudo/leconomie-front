import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-red-600 mb-4">404</p>
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Cette page est introuvable</h1>
      <p className="text-gray-500 dark:text-slate-400 mb-8">
        L&apos;adresse a peut-être changé, ou l&apos;article a été retiré.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
          Retour à l&apos;accueil
        </Link>
        <Link href="/recherche" className="border border-gray-300 dark:border-slate-600 font-semibold px-5 py-2.5 rounded-lg hover:border-red-600 hover:text-red-600 transition">
          Rechercher un article
        </Link>
      </div>
    </div>
  );
}
