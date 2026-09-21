"use client";

import { usePathname } from "next/navigation";

import TopBar from "@/components/navigation/TopBar";
import MainMenu from "@/components/navigation/MainMenu";
import BreakingNews from "@/components/layout/BreakingNews";
import Header from "@/components/layout/Header";
import HeaderBanner from "@/components/layout/HeaderBanner";
import Footer from "@/components/layout/Footer";
import RightClickProtection from "@/components/RightClickProtection";
import SupportChat from "@/components/SupportChat";
import CookieBanner from "@/components/CookieBanner";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <main>{children}</main>;
  }

  return (
    <>
      <RightClickProtection />
      <TopBar />
      <BreakingNews />
      <Header />

      {/* Bandeau publicitaire entre logo et navigation */}
      <HeaderBanner />

      <MainMenu />
      <main>{children}</main>
      <Footer />
      <SupportChat />
      <CookieBanner />
    </>
  );
}
