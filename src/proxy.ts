import { NextRequest, NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/lecture", "/mon-compte"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const access = req.cookies.get("abonne_access");

  if (!access) {
    return NextResponse.redirect(new URL("/connexion?raison=acces_reserve", req.url));
  }

  try {
    const raw = JSON.parse(access.value);

    // Format JWT WordPress
    if (raw.authToken) {
      if (isTokenExpired(raw.authToken)) {
        const res = NextResponse.redirect(new URL("/connexion?raison=session_expiree", req.url));
        res.cookies.set("abonne_access", "", { maxAge: 0, path: "/" });
        return res;
      }
      return NextResponse.next();
    }

    // Format MyCoolPay — vérifie l'expiration
    if (raw.email && raw.plan) {
      // Le plan gratuit peut accéder à /mon-compte mais pas à /lecture
      if (raw.plan === "gratuit" && pathname.startsWith("/lecture")) {
        return NextResponse.redirect(new URL("/abonnement?raison=plan_gratuit", req.url));
      }

      if (raw.expiresAt && Date.now() > raw.expiresAt) {
        const res = NextResponse.redirect(
          new URL("/abonnement?raison=abonnement_expire&email=" + encodeURIComponent(raw.email), req.url)
        );
        res.cookies.set(
          "abonne_access",
          JSON.stringify({ email: raw.email, plan: "gratuit", ref: raw.ref, expiresAt: 0 }),
          { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }
        );
        return res;
      }

      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/connexion?raison=session_invalide", req.url));
  } catch {
    return NextResponse.redirect(new URL("/connexion?raison=session_invalide", req.url));
  }
}

export const config = {
  matcher: ["/lecture/:path*", "/mon-compte/:path*"],
};
