"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({
  rightClickProtection,
  topBar,
  breakingNews,
  header,
  headerBanner,
  mainMenu,
  footer,
  supportChat,
  cookieBanner,
  children,
}: {
  rightClickProtection: React.ReactNode;
  topBar: React.ReactNode;
  breakingNews: React.ReactNode;
  header: React.ReactNode;
  headerBanner: React.ReactNode;
  mainMenu: React.ReactNode;
  footer: React.ReactNode;
  supportChat: React.ReactNode;
  cookieBanner: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <main>{children}</main>;
  }

  return (
    <>
      {rightClickProtection}
      {topBar}
      {breakingNews}
      {header}

      {/* Bandeau publicitaire entre logo et navigation */}
      {headerBanner}

      {mainMenu}
      <main>{children}</main>
      {footer}
      {supportChat}
      {cookieBanner}
    </>
  );
}
