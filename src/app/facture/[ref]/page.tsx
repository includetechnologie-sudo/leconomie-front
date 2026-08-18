import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { PLAN_LABELS } from "@/lib/subscription";
import PrintButton from "./PrintButton";

interface Paiement {
  email?: string;
  name?: string;
  plan?: string;
  amount?: number;
  date?: string;
  type?: string;
  titre?: string;
  reference?: string;
}

async function getPaiement(ref: string): Promise<Paiement | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "paiements.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const paiements: Paiement[] = JSON.parse(raw);
    return paiements.find((p) => p.reference === ref) || null;
  } catch {
    return null;
  }
}

export default async function FacturePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const paiement = await getPaiement(ref);

  if (!paiement) return notFound();

  const date = paiement.date
    ? new Date(paiement.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const heure = paiement.date
    ? new Date(paiement.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "";

  const amount = paiement.amount || 0;
  const amountFormatted = new Intl.NumberFormat("fr-FR").format(amount);

  const isAbonnement = paiement.type === "abonnement";
  const planLabel = paiement.plan ? (PLAN_LABELS[paiement.plan as keyof typeof PLAN_LABELS] || paiement.plan) : "";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Bouton imprimer - masqué à l'impression */}
      <div className="max-w-[600px] mx-auto mb-4 flex gap-3 print:hidden">
        <PrintButton />
        <a
          href="/mon-compte"
          className="bg-gray-800 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-900 transition text-sm"
        >
          Retour à mon compte
        </a>
      </div>

      {/* Facture */}
      <div className="max-w-[600px] mx-auto bg-white shadow-lg print:shadow-none">
        {/* En-tête */}
        <div className="bg-red-600 p-6 text-center">
          <img src="/images/favicon.png" alt="L'Economie" className="h-10 mx-auto mb-2" />
          <h1 className="text-white text-xl font-bold m-0">FACTURE</h1>
        </div>

        {/* Corps */}
        <div className="p-8">
          <p className="text-gray-700 mb-1">
            Bonjour <strong>{paiement.name || paiement.email}</strong>,
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Merci pour votre paiement. Voici votre facture récapitulative.
          </p>

          {/* Tableau infos */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">N° Facture</td>
                  <td className="py-2 text-right font-semibold">{ref}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Date</td>
                  <td className="py-2 text-right">{date}{heure ? ` à ${heure}` : ""}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Client</td>
                  <td className="py-2 text-right">{paiement.name || "—"} ({paiement.email})</td>
                </tr>
                {isAbonnement ? (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">Désignation</td>
                    <td className="py-2 text-right font-semibold">Abonnement {planLabel.split("—")[0].trim()}</td>
                  </tr>
                ) : (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-600">Désignation</td>
                      <td className="py-2 text-right font-semibold">
                        {paiement.type === "magazine" ? "Magazine" : "Journal quotidien"}
                      </td>
                    </tr>
                    {paiement.titre && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-600">Titre</td>
                        <td className="py-2 text-right">{paiement.titre}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Montant */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-800 text-xs uppercase tracking-wider mb-1">Montant payé</p>
            <p className="text-red-600 text-3xl font-extrabold">{amountFormatted} FCFA</p>
          </div>

          {/* Méthode */}
          <table className="w-full text-xs mb-6">
            <tbody>
              <tr>
                <td className="text-gray-500 py-1">Moyen de paiement</td>
                <td className="text-right">Mobile Money / Carte bancaire</td>
              </tr>
              <tr>
                <td className="text-gray-500 py-1">Statut</td>
                <td className="text-right">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">
                    Payé ✓
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pied de page */}
        <div className="p-5 text-center border-t">
          <p className="text-gray-400 text-xs mb-1">
            L&apos;Economie Media Group — Le Premier quotidien économique de la zone CEMAC
          </p>
          <p className="text-gray-400 text-xs mb-1">
            Tél : (+237) 672 556 944 / 693 537 690
          </p>
          <p className="text-gray-300 text-[10px]">
            Ce document tient lieu de facture. Conservez-le pour vos archives.
          </p>
        </div>
      </div>
    </div>
  );
}