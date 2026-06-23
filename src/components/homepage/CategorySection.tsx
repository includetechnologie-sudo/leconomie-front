import Image from "next/image";

type Props = {
  title: string;
};

export default function CategorySection({
  title,
}: Props) {
  return (
    <section className="bg-white border rounded-lg p-6">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-2xl font-bold text-red-600">
          {title}
        </h2>

        <button className="text-red-600 font-semibold">
          Voir plus →
        </button>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <Image
            src="/images/hero.jpg"
            alt={title}
            width={500}
            height={300}
            className="rounded-lg"
          />

          <h3 className="font-bold text-lg mt-3">
            Article principal de la rubrique
          </h3>

          <p className="text-gray-600 mt-2">
            Résumé de l article principal.
          </p>

        </div>

        <div>

          <ul className="space-y-4">

            <li>• Actualité importante</li>

            <li>• Analyse économique</li>

            <li>• Dossier spécial</li>

            <li>• Entretien exclusif</li>

            <li>• Décryptage du marché</li>

          </ul>

        </div>

      </div>

    </section>
  );
}