export default function MostReadSection() {
  console.log("MOST READ QUERY");
  const articles = [
    "BEAC : nouvelle stratégie monétaire pour la CEMAC",
    "Le Cameroun accélère ses projets d'infrastructures",
    "Les banques numériques séduisent les PME",
    "Hausse des investissements étrangers en Afrique centrale",
    "Décryptage : l'avenir du marché financier régional",
  ];

  return (
    <section className="max-w-7xl mx-auto mt-16 px-4">

      <div className="flex items-center justify-between mb-8">

        <h2 className="text-3xl font-bold">
          Les plus lus
        </h2>

        <div className="w-20 h-1 bg-red-600"></div>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

        {articles.map((article, index) => (
          <div
            key={index}
            className="
              border
              rounded-xl
              p-6
              hover:shadow-xl
              transition
              cursor-pointer
            "
          >
            <div className="text-5xl font-bold text-red-600 opacity-30">
              {String(index + 1).padStart(2, "0")}
            </div>

            <h3 className="mt-4 font-semibold leading-relaxed">
              {article}
            </h3>

          </div>
        ))}

      </div>

    </section>
  );
}