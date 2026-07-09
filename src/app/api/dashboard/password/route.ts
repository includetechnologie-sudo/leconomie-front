import { NextRequest, NextResponse } from "next/server";
import { checkDashboardAuth, saveDashboardPassword } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (!checkDashboardAuth(currentPassword)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 403 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court (minimum 6 caractères)" }, { status: 400 });
  }

  saveDashboardPassword(newPassword);
  return NextResponse.json({ success: true });
}
