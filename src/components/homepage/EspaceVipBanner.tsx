import Image from "next/image";
import fs from "fs";
import path from "path";

interface Banner {
  id: string;
  label: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  active: boolean;
}

// Contrairement aux autres bandeaux (id fixe posé à la main dans data/banners.json),
// celui-ci est créé depuis le dashboard ("+ Ajouter un bandeau"), qui génère un id
// aléatoire. On le retrouve donc par son label, que l'admin doit garder tel quel.
const LABEL = "Pub à côté de l'Espace VIP (accueil)";

function getBanner(): Banner | null {
  try {
    const file = path.join(process.cwd(), "data", "banners.json");
    const banners: Banner[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    return banners.find(b => b.label === LABEL && b.active) || null;
  } catch { return null; }
}

export default function EspaceVipBanner() {
  const banner = getBanner();
  if (!banner) return null;

  const isExternal = banner.linkUrl.startsWith("http");

  return (
    <a
      href={banner.linkUrl}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="relative block w-full h-full min-h-[220px] overflow-hidden rounded-xl border border-gray-200 hover:opacity-95 transition"
    >
      <Image
        src={banner.imageUrl}
        alt={banner.alt}
        fill
        className="object-cover"
      />
    </a>
  );
}
