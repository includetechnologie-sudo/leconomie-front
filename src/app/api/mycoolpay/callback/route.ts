import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { readAbonnes, writeAbonnes, saveSubscriber, type Subscriber } from "@/lib/abonnes";
import { readSubscribers, writeSubscribers, generateToken } from "@/lib/newsletter";
import type { Plan } from "@/lib/subscription";
import { PLAN_DURATION_DAYS, buildAccessCookie } from "@/lib/subscription";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import { createMagicLinkToken, sendMagicLinkEmail } from "@/lib/magic-link";

type PendingAchat = { email: string; name: string; type: "journal" | "magazine"; id: number; titre: string };
type PendingAbonnement = { email: string; name: string; type: "abonnement"; plan: Plan };
type PendingArticle = { email: string; slug: string; titre?: string; type: "article" };
type PendingEntry = PendingAchat | PendingAbonnement | PendingArticle;

const PENDING_FILE = path.join(process.cwd(), "data", "achats-pending.json");
const PAIEMENTS_FILE = path.join(process.cwd(), "data", "paiements.json");

function isSuccess(status: string | undefined | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "success" || s === "completed" || s === "successful";
}

function savePaiement(data: object) {
  try {
    const existing = JSON.parse(fs.readFileSync(PAIEMENTS_FILE, "utf-8"));
    existing.push({ ...data, date: new Date().toISOString() });
    fs.writeFileSync(PAIEMENTS_FILE, JSON.stringify(existing, null, 2));
  } catch {}
}

async function resolvePending(ref: string): Promise<PendingEntry | null> {
  try {
    const raw = await fsPromises.readFile(PENDING_FILE, "utf-8");
    const pending = JSON.parse(raw);
    return pending[ref] || null;
  } catch {
    return null;
  }
}

async function deletePending(ref: string) {
  try {
    const raw = await fsPromises.readFile(PENDING_FILE, "utf-8");
    const pending = JSON.parse(raw);
    delete pending[ref];
    await fsPromises.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
  } catch {}
}

async function subscribeToNewsletter(email: string) {
  try {
    const subscribers = await readSubscribers();
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) return;
    const token = generateToken(email);
    subscribers.push({ email, token, createdAt: Date.now() });
    await writeSubscribers(subscribers);
  } catch (err) {
    console.error("Auto-subscribe newsletter error:", err);
  }
}

// Envoie un lien de connexion magique (sans mot de passe) après création d'un compte
async function sendAccountCreationEmail(email: string, name: string, titre?: string) {
  const token = await createMagicLinkToken(email);
  await sendMagicLinkEmail(email, name, token, { titre });
}

async function sendAchatEmail(email: string, name: string, titre: string, id: number) {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Votre achat — ${titre}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:white;margin:0;font-size:24px">L'Economie</h1>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>Merci pour votre achat. Votre exemplaire <strong style="color:#dc2626">${titre}</strong> est disponible dans votre espace.</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${siteUrl}/mon-compte#achats"
                 style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none">
                Accéder à mon exemplaire
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px">
              Connectez-vous sur <a href="${siteUrl}/connexion" style="color:#dc2626">leconomie.info</a>
              puis allez dans <strong>Mon compte → Mes achats</strong> pour lire votre exemplaire.
            </p>
            <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:20px">
              Référence interne : ${id}
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Achat email error:", err);
  }
}

// Callback serveur-à-serveur (POST) envoyé par MyCoolPay après paiement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("MyCoolPay webhook:", JSON.stringify(body, null, 2));

    const status = body.status || body.transaction_status;
    const reference = body.app_transaction_ref || body.transaction_ref;

    if (!isSuccess(status) || !reference) {
      console.log("MyCoolPay webhook: statut non-success ou référence manquante", { status, reference });
      return NextResponse.json({ received: true });
    }

    const pending = await resolvePending(reference);
    if (!pending) {
      console.error("MyCoolPay webhook: pending introuvable pour ref", reference);
      return NextResponse.json({ received: true });
    }

    const email = pending.email;
    const name = "name" in pending ? pending.name : email.split("@")[0];
    const paymentMethod = body.payment_method || body.operator || (body.channel === "card" ? "card" : "mobile");

    // ── Abonnement mensuel / annuel ──────────────────────────────────────────
    if (pending.type === "abonnement") {
      const plan = pending.plan as Plan;
      const amount = Number(body.transaction_amount) || 0;
      savePaiement({ email, reference, plan, type: "abonnement", amount, paymentMethod });
      await saveSubscriber(email, name || email.split("@")[0], plan, reference);
      await deletePending(reference);

      const days = PLAN_DURATION_DAYS[plan] || 31;
      const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      Promise.resolve().then(() => sendInvoiceEmail({
        type: "abonnement",
        email,
        name: name || email.split("@")[0],
        plan,
        amount,
        reference,
        expiresAt,
      }));

      console.log(`MyCoolPay webhook: abonnement ${plan} confirmé pour ${email}`);
      return NextResponse.json({ received: true });
    }

    // ── Achat unitaire article (48h) ────────────────────────────────────────
    if (pending.type === "article") {
      const { slug, titre } = pending as PendingArticle;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const displayTitre = titre || slug;

      const achatsFile = path.join(process.cwd(), "data", "achats-articles.json");
      let achats: object[] = [];
      try { achats = JSON.parse(fs.readFileSync(achatsFile, "utf-8")); } catch {}
      achats.push({ email, slug, purchasedAt: now.toISOString(), reference, expiresAt: expiresAt.toISOString() });
      fs.writeFileSync(achatsFile, JSON.stringify(achats, null, 2));

      savePaiement({ email, reference, type: "achat-article", slug, amount: 200, paymentMethod });

      // Rattache l'achat au compte de l'utilisateur pour qu'il apparaisse dans "Mes achats"
      const abonnesForArticle = await readAbonnes();
      const idx = abonnesForArticle.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
      const achatEntry = { type: "article" as const, slug, titre: displayTitre, ref: reference, acheteLe: Date.now(), expiresAt: expiresAt.getTime() };
      const isNewUser = idx < 0;

      if (idx >= 0) {
        abonnesForArticle[idx].achats = [...(abonnesForArticle[idx].achats || []), achatEntry];
      } else {
        abonnesForArticle.push({
          email,
          name: name || email.split("@")[0],
          plan: "gratuit",
          ref: reference,
          expiresAt: 0,
          createdAt: Date.now(),
          achats: [achatEntry],
        });
      }
      await writeAbonnes(abonnesForArticle);
      await deletePending(reference);

      const displayName = name || email.split("@")[0];
      if (isNewUser) {
        Promise.resolve().then(() => sendAccountCreationEmail(email, displayName, displayTitre));
      }

      console.log(`MyCoolPay webhook: achat article confirmé pour ${email} — ${slug} (expire ${expiresAt.toISOString()})`);
      return NextResponse.json({ received: true });
    }

    // ── Achat unitaire journal / magazine ────────────────────────────────────
    const { id, type, titre } = pending as PendingAchat;

    savePaiement({ email, reference, titre, id, type, amount: body.transaction_amount, paymentMethod });

    const abonnes = await readAbonnes();
    const idx = abonnes.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
    const achat = { id, type, titre, ref: reference, acheteLe: Date.now() };

    const isNewUser = idx < 0;

    if (idx >= 0) {
      const existing = abonnes[idx];
      const dejaAchete = existing.achats?.some((a) => a.type !== "article" && a.id === id && a.type === type);
      if (!dejaAchete) {
        existing.achats = [...(existing.achats || []), achat];
        abonnes[idx] = existing;
        await writeAbonnes(abonnes);
      }
    } else {
      abonnes.push({
        email,
        name: name || email.split("@")[0],
        plan: "gratuit",
        ref: reference,
        expiresAt: 0,
        createdAt: Date.now(),
        achats: [achat],
      });
      await writeAbonnes(abonnes);
    }

    await deletePending(reference);

    const displayName = name || email.split("@")[0];
    const achatAmount = Number(body.transaction_amount) || 0;
    Promise.resolve().then(() => sendAchatEmail(email, displayName, titre, id));
    Promise.resolve().then(() => sendInvoiceEmail({
      type: "achat",
      email,
      name: displayName,
      itemType: type,
      titre,
      amount: achatAmount,
      reference,
    }));

    // Pour les achats de journal : inscription newsletter + email de création de compte
    if (type === "journal") {
      Promise.resolve().then(() => subscribeToNewsletter(email));
      if (isNewUser) {
        Promise.resolve().then(() => sendAccountCreationEmail(email, displayName, titre));
      }
    }

    console.log(`MyCoolPay webhook: achat confirmé pour ${email} — ${titre}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("MyCoolPay callback error:", err);
    return NextResponse.json({ received: true });
  }
}

function setAutoLogin(response: NextResponse, email: string, plan: Plan, ref: string, name?: string) {
  const cookieValue = buildAccessCookie(email, plan, ref, name);
  response.cookies.set("abonne_access", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

// Retour navigateur (GET) après paiement MyCoolPay
export async function GET(req: NextRequest) {
  const reference =
    req.nextUrl.searchParams.get("ref") ||
    req.nextUrl.searchParams.get("app_transaction_ref") ||
    req.nextUrl.searchParams.get("transaction_ref");

  const status =
    req.nextUrl.searchParams.get("status") ||
    req.nextUrl.searchParams.get("transaction_status");

  if (!reference) {
    return NextResponse.redirect(new URL("/abonnement?erreur=reference_manquante", req.url));
  }

  if (isSuccess(status)) {
    const pending = await resolvePending(reference);
    const email = pending?.email || req.nextUrl.searchParams.get("email") || "";

    if (pending) {
      const name = "name" in pending ? pending.name : email.split("@")[0];

      // Achat article (48h) — redirection après paiement
      if (pending.type === "article") {
        const { slug, titre } = pending as PendingArticle;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const displayTitre = titre || slug;

        const achatsFile = path.join(process.cwd(), "data", "achats-articles.json");
        let achats: object[] = [];
        try { achats = JSON.parse(fs.readFileSync(achatsFile, "utf-8")); } catch {}
        achats.push({ email, slug, purchasedAt: now.toISOString(), reference, expiresAt: expiresAt.toISOString() });
        fs.writeFileSync(achatsFile, JSON.stringify(achats, null, 2));

        savePaiement({ email, reference, type: "achat-article", slug, amount: 200 });

        // Rattache l'achat au compte + auto-login après achat article
        const abonnesForArticle = await readAbonnes();
        const idx = abonnesForArticle.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
        const achatEntry = { type: "article" as const, slug, titre: displayTitre, ref: reference, acheteLe: Date.now(), expiresAt: expiresAt.getTime() };
        const isNewUser = idx < 0;

        let articleUser: Subscriber;
        if (idx >= 0) {
          abonnesForArticle[idx].achats = [...(abonnesForArticle[idx].achats || []), achatEntry];
          articleUser = abonnesForArticle[idx];
        } else {
          articleUser = { email, name: name || email.split("@")[0], plan: "gratuit" as Plan, ref: reference, expiresAt: 0, createdAt: Date.now(), achats: [achatEntry] };
          abonnesForArticle.push(articleUser);
        }
        await writeAbonnes(abonnesForArticle);
        await deletePending(reference);

        const displayName = name || email.split("@")[0];
        if (isNewUser) {
          Promise.resolve().then(() => sendAccountCreationEmail(email, displayName, displayTitre));
        }

        const articleResponse = NextResponse.redirect(new URL(`/article/${slug}?achat=ok`, req.url));
        return setAutoLogin(articleResponse, email, articleUser.plan, articleUser.ref, name);
      }

      // Abonnement mensuel / annuel
      if (pending.type === "abonnement") {
        const plan = pending.plan as Plan;
        savePaiement({ email, reference, plan, type: "abonnement" });
        await saveSubscriber(email, name || email.split("@")[0], plan, reference);
        await deletePending(reference);

        const days = PLAN_DURATION_DAYS[plan] || 31;
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
        Promise.resolve().then(() => sendInvoiceEmail({
          type: "abonnement",
          email,
          name: name || email.split("@")[0],
          plan,
          amount: plan === "annuel" ? 50000 : 5000,
          reference,
          expiresAt,
        }));

        // Auto-login après abonnement
        const aboResponse = NextResponse.redirect(new URL(`/paiement-succes?ref=${reference}&email=${encodeURIComponent(email)}&plan=${plan}`, req.url));
        return setAutoLogin(aboResponse, email, plan, reference, name);
      }

      // Achat unitaire
      const { id, type, titre } = pending as PendingAchat;
      savePaiement({ email, reference, titre, id, type });

      const abonnes = await readAbonnes();
      const idx = abonnes.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
      const achat = { id, type, titre, ref: reference, acheteLe: Date.now() };
      const isNewUser = idx < 0;

      if (idx >= 0) {
        const existing = abonnes[idx];
        const dejaAchete = existing.achats?.some((a) => a.type !== "article" && a.id === id && a.type === type);
        if (!dejaAchete) {
          existing.achats = [...(existing.achats || []), achat];
          abonnes[idx] = existing;
          await writeAbonnes(abonnes);
        }
      } else {
        abonnes.push({
          email,
          name: name || email.split("@")[0],
          plan: "gratuit",
          ref: reference,
          expiresAt: 0,
          createdAt: Date.now(),
          achats: [achat],
        });
        await writeAbonnes(abonnes);
      }

      await deletePending(reference);
      const displayName = name || email.split("@")[0];
      Promise.resolve().then(() => sendAchatEmail(email, displayName, titre, id));
      Promise.resolve().then(() => sendInvoiceEmail({
        type: "achat",
        email,
        name: displayName,
        itemType: type,
        titre,
        amount: type === "magazine" ? 1000 : 200,
        reference,
      }));

      if (type === "journal") {
        Promise.resolve().then(() => subscribeToNewsletter(email));
        if (isNewUser) {
          Promise.resolve().then(() => sendAccountCreationEmail(email, displayName, titre));
        }
      }
    }

    // Auto-login après achat journal/magazine
    const finalAbonnes = await readAbonnes();
    const finalUser = finalAbonnes.find(a => a.email.toLowerCase() === email.toLowerCase());
    const successResponse = NextResponse.redirect(new URL(`/paiement-succes?ref=${reference}&email=${encodeURIComponent(email)}`, req.url));
    if (finalUser) {
      return setAutoLogin(successResponse, email, finalUser.plan, finalUser.ref, finalUser.name);
    }
    return successResponse;
  }

  return NextResponse.redirect(
    new URL(`/abonnement?erreur=paiement_echoue&ref=${reference}`, req.url)
  );
}
