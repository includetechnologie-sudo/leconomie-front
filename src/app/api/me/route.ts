import { NextRequest, NextResponse } from "next/server";
import { parseAccessCookie } from "@/lib/parse-access";

// Abonné connecté (nom, email) pour l'en-tête. Lu côté navigateur afin que les pages elles-mêmes
// puissent être mises en cache, au lieu d'être recalculées à chaque visite à cause du cookie.
export async function GET(req: NextRequest) {
  const access = req.cookies.get("abonne_access");
  const user = access ? parseAccessCookie(access.value) : null;
  return NextResponse.json(
    { user: user ? { name: user.name, email: user.email } : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
