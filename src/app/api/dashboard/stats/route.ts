import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function readJSON(file: string) {
  try {
    const p = path.join(process.cwd(), "data", file);
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (auth !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const subscribers: string[] = readJSON("newsletter-subscribers.json");
  const paiements: object[] = readJSON("paiements.json");
  const devis: object[] = readJSON("devis.json");

  // Articles WordPress via GraphQL
  let articles = { total: 0, recent: [] as { title: string; date: string; slug: string }[] };
  try {
    const gql = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://teal-horse-411567.hostingersite.com/graphql"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ posts(first: 5, where: { status: PUBLISH }) { nodes { title date slug } pageInfo { total } } }`,
        }),
        next: { revalidate: 300 },
      }
    );
    const data = await gql.json();
    articles.recent = data?.data?.posts?.nodes || [];
    articles.total = data?.data?.posts?.pageInfo?.total || 0;
  } catch {}

  // Revenus calculés depuis paiements
  const revenus = (paiements as { amount?: number; plan?: string }[]).reduce((sum, p) => sum + (p.amount || 0), 0);
  const mensuel = (paiements as { plan?: string }[]).filter(p => p.plan === "mensuel").length;
  const annuel = (paiements as { plan?: string }[]).filter(p => p.plan === "annuel").length;

  return NextResponse.json({
    newsletter: { total: subscribers.length, list: subscribers },
    paiements: { total: paiements.length, revenus, mensuel, annuel, recent: (paiements as object[]).slice(-10).reverse() },
    devis: { total: devis.length, recent: (devis as object[]).slice(-10).reverse() },
    articles,
  });
}
