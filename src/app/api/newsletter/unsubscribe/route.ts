import { NextRequest, NextResponse } from "next/server";
import { readSubscribers, writeSubscribers } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!email || !token) {
    return NextResponse.redirect(new URL("/?newsletter=erreur", req.url));
  }

  const subscribers = await readSubscribers();
  const idx = subscribers.findIndex((s) => s.email === email && s.token === token);

  if (idx === -1) {
    return NextResponse.redirect(new URL("/?newsletter=lien_invalide", req.url));
  }

  subscribers.splice(idx, 1);
  await writeSubscribers(subscribers);

  return NextResponse.redirect(new URL("/?newsletter=desabonne", req.url));
}
