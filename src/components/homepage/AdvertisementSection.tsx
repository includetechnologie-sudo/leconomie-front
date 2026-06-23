import Image from "next/image";

export default function AdvertisementSection() {
  return (
    <section className="max-w-7xl mx-auto mt-10 px-4">
      <a
        href="https://leconomie.info"
        target="_blank"
        rel="noreferrer"
        className="block w-full overflow-hidden rounded-lg hover:opacity-95 transition"
      >
        <Image
          src="/images/bandeau-promote.jpg"
          alt="Offre Spéciale PROMOTE — 50% de réduction sur les insertions publicitaires"
          width={1400}
          height={224}
          className="w-full h-auto object-cover"
          priority
        />
      </a>
    </section>
  );
}