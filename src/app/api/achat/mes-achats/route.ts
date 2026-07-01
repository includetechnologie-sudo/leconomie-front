import { NextRequest, NextResponse } from "next/server";
import { readAbonnes } from "@/lib/abonnes";

export async function GET(req: NextRequest) {
  const access = req.cookies.get("abonne_access");
  if (!access) return NextResponse.json({ achats: [] });

  try {
    const { email } = JSON.parse(access.value);
    if (!email) return NextResponse.json({ achats: [] });

    const abonnes = await readAbonnes();
    const abonne = abonnes.find((a) => a.email === email);
    return NextResponse.json({ achats: abonne?.achats || [] });
  } catch {
    return NextResponse.json({ achats: [] });
  }
}
