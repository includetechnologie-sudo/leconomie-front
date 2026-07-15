import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données personnelles de leconomie.info",
};

export default function Confidentialite() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

      <div className="prose prose-lg max-w-none">

        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles collectées sur <strong>leconomie.info</strong>
          est le journal <strong>L'Economie</strong>, situé à Douala, Cameroun.
          Contact : <strong>contact@leconomie.info</strong>
        </p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Données d'inscription</strong> : nom, adresse email, lors de la création d'un compte ou d'un abonnement à la newsletter.</li>
          <li><strong>Données de paiement</strong> : traitées par nos prestataires de paiement sécurisés (MyCoolPay). Nous ne stockons pas vos données bancaires.</li>
          <li><strong>Données de navigation</strong> : pages visitées, durée de visite, type de navigateur — collectées de manière anonyme à des fins statistiques.</li>
          <li><strong>Données de contact</strong> : informations fournies via le formulaire de contact ou de devis.</li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>La gestion de votre compte et de votre abonnement</li>
          <li>L'envoi de la newsletter (avec votre consentement)</li>
          <li>Le traitement de vos demandes de contact ou de devis</li>
          <li>L'amélioration de nos services et l'analyse des audiences</li>
          <li>Le respect de nos obligations légales</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>
          Le traitement de vos données repose sur votre consentement (newsletter),
          l'exécution d'un contrat (abonnement) ou notre intérêt légitime (statistiques anonymes).
        </p>

        <h2>5. Conservation des données</h2>
        <p>
          Vos données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées :
        </p>
        <ul>
          <li>Données de compte : durée de l'abonnement + 3 ans</li>
          <li>Newsletter : jusqu'au désabonnement</li>
          <li>Données de contact : 3 ans</li>
        </ul>

        <h2>6. Partage des données</h2>
        <p>
          Nous ne vendons pas vos données personnelles. Elles peuvent être partagées avec :
        </p>
        <ul>
          <li>Nos prestataires techniques (hébergement, paiement) dans le cadre de l'exécution du service</li>
          <li>Les autorités compétentes si la loi l'exige</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          Le site utilise des cookies techniques indispensables au fonctionnement (session, authentification).
          Aucun cookie publicitaire tiers n'est utilisé sans votre consentement.
        </p>

        <h2>8. Vos droits</h2>
        <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (droit à l'oubli)</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit de désabonnement de la newsletter à tout moment</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à <strong>contact@leconomie.info</strong>.
        </p>

        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
          vos données contre tout accès non autorisé, perte ou divulgation (HTTPS, chiffrement, accès restreint).
        </p>

        <h2>10. Contact</h2>
        <p>
          Pour toute question relative à cette politique, contactez-nous via la{" "}
          <a href="/contact" className="text-red-600 hover:underline">page de contact</a>{" "}
          ou à <strong>contact@leconomie.info</strong>.
        </p>

      </div>
    </div>
  );
}
