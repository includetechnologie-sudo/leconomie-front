import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { readAbonnes, writeAbonnes, saveSubscriber } from "@/lib/abonnes";
import type { Plan } from "@/lib/subscription";

type PendingAchat = { email: string; name: string; type: "journal" | "magazine"; id: number; titre: string };
type PendingAbonnement = { email: string; name: string; type: "abonnement"; plan: Plan };
type PendingEntry = PendingAchat | PendingAbonnement;

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
      from: `"L'Économie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Votre achat — ${titre}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:white;margin:0;font-size:24px">L'Économie</h1>
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

    const { email, name } = pending;

    // ── Abonnement mensuel / annuel ──────────────────────────────────────────
    if (pending.type === "abonnement") {
      const plan = pending.plan as Plan;
      savePaiement({ email, reference, plan, type: "abonnement", amount: body.transaction_amount });
      await saveSubscriber(email, name || email.split("@")[0], plan, reference);
      await deletePending(reference);
      console.log(`MyCoolPay webhook: abonnement ${plan} confirmé pour ${email}`);
      return NextResponse.json({ received: true });
    }

    // ── Achat unitaire journal / magazine ────────────────────────────────────
    const { id, type, titre } = pending as PendingAchat;

    savePaiement({ email, reference, titre, id, type, amount: body.transaction_amount });

    const abonnes = await readAbonnes();
    const idx = abonnes.findIndex((a) => a.email === email);
    const achat = { id, type, titre, ref: reference, acheteLe: Date.now() };

    if (idx >= 0) {
      const existing = abonnes[idx];
      const dejaAchete = existing.achats?.some((a) => a.id === id && a.type === type);
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

    Promise.resolve().then(() => sendAchatEmail(email, name || email.split("@")[0], titre, id));

    console.log(`MyCoolPay webhook: achat confirmé pour ${email} — ${titre}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("MyCoolPay callback error:", err);
    return NextResponse.json({ received: true });
  }
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
      const { name } = pending;

      // Abonnement mensuel / annuel
      if (pending.type === "abonnement") {
        const plan = pending.plan as Plan;
        savePaiement({ email, reference, plan, type: "abonnement" });
        await saveSubscriber(email, name || email.split("@")[0], plan, reference);
        await deletePending(reference);
        return NextResponse.redirect(new URL(`/paiement-succes?ref=${reference}&email=${encodeURIComponent(email)}&plan=${plan}`, req.url));
      }

      // Achat unitaire
      const { id, type, titre } = pending as PendingAchat;
      savePaiement({ email, reference, titre, id, type });

      const abonnes = await readAbonnes();
      const idx = abonnes.findIndex((a) => a.email === email);
      const achat = { id, type, titre, ref: reference, acheteLe: Date.now() };

      if (idx >= 0) {
        const existing = abonnes[idx];
        const dejaAchete = existing.achats?.some((a) => a.id === id && a.type === type);
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
      Promise.resolve().then(() => sendAchatEmail(email, name || email.split("@")[0], titre, id));
    }

    return NextResponse.redirect(new URL(`/paiement-succes?ref=${reference}&email=${encodeURIComponent(email)}`, req.url));
  }

  return NextResponse.redirect(
    new URL(`/abonnement?erreur=paiement_echoue&ref=${reference}`, req.url)
  );
}
