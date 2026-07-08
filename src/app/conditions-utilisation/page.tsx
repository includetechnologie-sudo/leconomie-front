import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation du site leconomie.info",
};

export default function ConditionsUtilisation() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Conditions d'utilisation</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

      <div className="prose prose-lg max-w-none">

        <h2>1. Présentation du site</h2>
        <p>
          Le site <strong>leconomie.info</strong> est édité par le journal <strong>L'Économie</strong>,
          premier quotidien économique de la zone CEMAC, dont le siège est situé à Douala, Cameroun.
          Le site propose des contenus informatifs, économiques et financiers relatifs à la zone CEMAC
          (Cameroun, Gabon, Congo, Tchad, République Centrafricaine, Guinée Équatoriale).
        </p>

        <h2>2. Accès au site</h2>
        <p>
          L'accès au site est libre et gratuit pour la consultation des articles publics.
          Certains contenus premium sont réservés aux abonnés disposant d'un compte actif.
          L'utilisateur s'engage à accéder au site en utilisant un matériel récent ne contenant pas de virus
          et avec un navigateur de dernière génération mis à jour.
        </p>

        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur leconomie.info (textes, images, vidéos, graphiques, logos)
          sont la propriété exclusive de <strong>L'Économie</strong> ou de ses partenaires et sont protégés
          par les lois relatives à la propriété intellectuelle. Toute reproduction, représentation,
          modification, publication ou adaptation, totale ou partielle, est strictement interdite
          sans l'accord écrit préalable de la rédaction.
        </p>

        <h2>4. Abonnements et paiements</h2>
        <p>
          Les abonnements numériques sont proposés à titre onéreux. Les tarifs sont indiqués en FCFA
          et sont susceptibles d'être modifiés à tout moment. Le paiement s'effectue via les plateformes
          de paiement sécurisées disponibles sur le site. Toute souscription est ferme et définitive.
          Aucun remboursement ne sera effectué sauf cas de force majeure ou dysfonctionnement technique
          imputable au site.
        </p>

        <h2>5. Responsabilité</h2>
        <p>
          L'Économie s'efforce de fournir des informations exactes et à jour. Toutefois, la rédaction
          ne peut être tenue responsable des erreurs, omissions ou résultats obtenus suite à l'utilisation
          de ces informations. Les informations publiées ne constituent pas des conseils financiers,
          juridiques ou professionnels.
        </p>

        <h2>6. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. L'Économie n'exerce aucun contrôle
          sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.
        </p>

        <h2>7. Modification des conditions</h2>
        <p>
          L'Économie se réserve le droit de modifier les présentes conditions d'utilisation à tout moment.
          Les utilisateurs sont invités à les consulter régulièrement. L'utilisation continue du site
          après modification vaut acceptation des nouvelles conditions.
        </p>

        <h2>8. Droit applicable</h2>
        <p>
          Les présentes conditions sont régies par le droit camerounais. Tout litige relatif à leur
          interprétation ou exécution relève de la compétence exclusive des tribunaux de Douala, Cameroun.
        </p>

        <h2>9. Contact</h2>
        <p>
          Pour toute question relative aux présentes conditions, vous pouvez nous contacter via
          la <a href="/contact" className="text-red-600 hover:underline">page de contact</a> du site
          ou par email à <strong>contact@leconomie.info</strong>.
        </p>

      </div>
    </div>
  );
}
