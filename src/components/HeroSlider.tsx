import Image from "next/image";

export default function HeroSlider() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Article principal */}

        <div className="lg:col-span-2 relative rounded-xl overflow-hidden">

          <div className="relative h-[550px]">

            <Image
              src="/images/hero.jpg"
              alt="Actualité principale"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-0 p-8 text-white">

              <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold">
                CEMAC
              </span>

              <h1 className="text-4xl font-bold mt-4 leading-tight">
                La croissance économique de la CEMAC devrait accélérer en 2026
              </h1>

              <p className="mt-4 text-gray-200">
                Les investissements publics et privés devraient soutenir
                la croissance régionale malgré les défis mondiaux.
              </p>

              <div className="flex gap-4 mt-4 text-sm text-gray-300">

                <span>Rédaction</span>

                <span>•</span>

                <span>03 Juin 2026</span>

                <span>•</span>

                <span>5 min lecture</span>

              </div>

            </div>

          </div>

        </div>

        {/* Sidebar */}

        <div className="space-y-5">

          {[1, 2, 3, 4].map((item) => (
            <article
              key={item}
              className="flex gap-4 border-b pb-4"
            >
              <div className="w-28 h-24 bg-gray-300 rounded-lg"></div>

              <div>

                <span className="text-red-600 text-sm font-semibold">
                  Finance
                </span>

                <h3 className="font-bold mt-2 leading-snug">
                  Les banques renforcent leurs services numériques
                </h3>

              </div>

            </article>
          ))}

        </div>

      </div>

    </section>
  );
}