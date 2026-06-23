import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyPassword } from "@/lib/password";
import { buildAccessCookie, type Plan } from "@/lib/subscription";

const DATA_FILE = path.join(process.cwd(), "data", "abonnes.json");

interface LocalSubscriber {
  email: string;
  name: string;
  plan: Plan;
  ref: string;
  expiresAt: number;
  passwordHash?: string;
}

async function tryLocalLogin(email: string, password: string): Promise<Response | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const abonnes: LocalSubscriber[] = JSON.parse(raw);
    const sub = abonnes.find((a) => a.email === email);
    if (!sub || !sub.passwordHash) return null;

    const valid = await verifyPassword(password, sub.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    const cookieValue = buildAccessCookie(sub.email, sub.plan, sub.ref, sub.name);
    const response = NextResponse.json({
      success: true,
      redirect: "/mon-compte",
      user: { name: sub.name, email: sub.email },
    });
    response.cookies.set("abonne_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  } catch {
    return null;
  }
}

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        name
        email
        roles { nodes { name } }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  const { email, password, remember } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const wpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!wpUrl) {
    return NextResponse.json({ error: "Configuration serveur manquante." }, { status: 500 });
  }

  // Essaie d'abord la connexion locale (abonnés MyCoolPay)
  const localResponse = await tryLocalLogin(email, password);
  if (localResponse) return localResponse;

  try {
    const wpRes = await fetch(wpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { username: email, password },
      }),
    });

    const json = await wpRes.json();

    // Erreur GraphQL (mauvais identifiants, etc.)
    if (json.errors?.length) {
      const msg = json.errors[0].message as string;
      if (msg.includes("password") || msg.includes("credentials") || msg.includes("incorrect")) {
        return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
      }
      // Utilisateur sans abonnement actif
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé.", redirect_to_subscribe: true },
        { status: 401 }
      );
    }

    const { authToken, refreshToken, user } = json.data.login;
    const roles: string[] = user.roles.nodes.map((r: { name: string }) => r.name);

    // Vérification : seuls les rôles subscriber/administrator ont accès
    const hasAccess = roles.some((r) =>
      ["subscriber", "administrator", "editor", "author"].includes(r)
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé.", redirect_to_subscribe: true },
        { status: 401 }
      );
    }

    const cookieValue = JSON.stringify({
      authToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, roles },
    });

    const maxAge = remember ? 365 * 24 * 3600 : 7 * 24 * 3600;
    const response = NextResponse.json({
      success: true,
      redirect: "/mon-compte",
      user: { name: user.name, email: user.email },
    });

    response.cookies.set("abonne_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;

  } catch {
    return NextResponse.json(
      { error: "Erreur de connexion au serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
