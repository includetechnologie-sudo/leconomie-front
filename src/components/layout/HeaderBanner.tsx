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

export default function HeaderBanner() {
  const banner = getBanner("header");
  if (!banner) return null;

  const isExternal = banner.linkUrl.startsWith("http");

  return (
    <div className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <a
          href={banner.linkUrl}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="block"
        >
          <img
            src={banner.imageUrl}
            alt={banner.alt}
            className="w-full h-auto object-contain max-h-[100px]"
          />
        </a>
      </div>
    </div>
  );
}
