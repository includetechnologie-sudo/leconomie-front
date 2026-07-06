import Image from "next/image";

export default function AdvertisementSection() {
  return (
    <section className="max-w-7xl mx-auto mt-10 px-4">
      <a
        href="https://www.leconomiebusinesssummit.fr"
        target="_blank"
        rel="noreferrer"
        className="block w-full overflow-hidden rounded-lg hover:opacity-95 transition"
      >
        <Image
          src="https://teal-horse-411567.hostingersite.com/wp-content/uploads/2026/07/bandeau-summit-scaled.jpg"
          alt="L'Économie Business Summit 4e édition — Paris"
          width={1400}
          height={224}
          className="w-full h-auto object-cover"
          priority
        />
      </a>
    </section>
  );
}