import Image from "next/image";
import fs from "fs";
import path from "path";

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  active: boolean;
}

function getBanner(id: string): Banner | null {
  try {
    const file = path.join(process.cwd(), "data", "banners.json");
    const banners: Banner[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    return banners.find(b => b.id === id && b.active) || null;
  } catch { return null; }
}

export default function AdvertisementSection() {
  const banner = getBanner("homepage-mid");
  if (!banner) return null;

  const isExternal = banner.linkUrl.startsWith("http");

  return (
    <section className="max-w-7xl mx-auto mt-10 px-4">
      <a
        href={banner.linkUrl}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="block w-full overflow-hidden rounded-lg hover:opacity-95 transition"
      >
        <Image
          src={banner.imageUrl}
          alt={banner.alt}
          width={1400}
          height={224}
          className="w-full h-auto object-cover"
          priority
        />
      </a>
    </section>
  );
}
