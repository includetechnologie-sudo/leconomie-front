import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";

import TopBar from "@/components/navigation/TopBar";
import BreakingNews from "@/components/layout/BreakingNews";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MainMenu from "@/components/navigation/MainMenu";
import RightClickProtection from "@/components/RightClickProtection";
import PageLoader from "@/components/layout/PageLoader";
import OnlineHeartbeat from "@/components/layout/OnlineHeartbeat";
import OneSignalInit from "@/components/layout/OneSignalInit";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["300", "400", "600", "700", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "L'Economie — Le premier quotidien économique de la zone CEMAC",
    template: "%s — L'Economie",
  },
  description: "Actualités économiques, financières et politiques de la zone CEMAC. Cameroun, Gabon, Congo, Tchad, RCA, Guinée Équatoriale.",
  keywords: ["économie", "CEMAC", "Cameroun", "finance", "actualités", "Afrique centrale", "journal"],
  authors: [{ name: "L'Economie", url: SITE_URL }],
  creator: "L'Economie",
  publisher: "L'Economie",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "L'Economie",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "L'Economie",
    title: "L'Economie — Le premier quotidien économique de la zone CEMAC",
    description: "Actualités économiques, financières et politiques de la zone CEMAC.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "L'Economie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "L'Economie — Le premier quotidien économique de la zone CEMAC",
    description: "Actualités économiques, financières et politiques de la zone CEMAC.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "L'Economie",
  "url": "https://leconomie.info",
  "logo": {
    "@type": "ImageObject",
    "url": "https://leconomie.info/images/favicon.png",
    "width": 512,
    "height": 512,
  },
  "sameAs": [
    "https://www.facebook.com/leconomie.info",
  ],
  "description": "Le premier quotidien économique de la zone CEMAC",
  "foundingDate": "2010",
  "areaServed": ["CM", "GA", "CG", "TD", "CF", "GQ"],
  "inLanguage": "fr",
};

export function generateViewport() {
  return { themeColor: "#dc2626" };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {/* Google Reader Revenue Manager */}
        <script async type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js" />
        <script dangerouslySetInnerHTML={{ __html: `(self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => { basicSubscriptions.init({ type: "NewsArticle", isPartOfType: ["Product"], isPartOfProductId: "CAow_bHHCw:openaccess", clientOptions: { theme: "light", lang: "fr" }, }); });` }} />
        <PageLoader />
        <OnlineHeartbeat />
        <OneSignalInit />
        <RightClickProtection />
        <TopBar />
        <BreakingNews />
        <Header />

        {/* Bandeau publicitaire entre logo et navigation */}
        <div className="hidden lg:block bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <a href="/magazine?tab=magazines" className="block">
              <img
                src="https://teal-horse-411567.hostingersite.com/wp-content/uploads/2026/07/bandeau-magazine-2026-scaled.jpg"
                alt="Votre magazine L'Economie International — disponible sur notre site web"
                className="w-full h-auto object-contain max-h-[100px]"
              />
            </a>
          </div>
        </div>

        <MainMenu />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
