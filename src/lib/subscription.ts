export type Plan = "gratuit" | "mensuel" | "annuel";

export interface Subscription {
  email: string;
  plan: Plan;
  ref: string;
  expiresAt: number; // timestamp ms
  name?: string;
}

export interface AccessUser {
  name: string;
  email: string;
  roles: string[];
  plan: Plan;
  ref?: string;
  expiresAt?: number;
  isExpired?: boolean;
}

export const PLAN_DURATION_DAYS: Record<Plan, number> = {
  gratuit: 0,
  mensuel: 31,
  annuel: 365,
};

export const PLAN_LABELS: Record<Plan, string> = {
  gratuit: "Gratuit",
  mensuel: "Mensuel — 5 000 FCFA/mois",
  annuel: "Annuel — 50 000 FCFA/an",
};

// Droits d'accès par plan
export const PLAN_RIGHTS: Record<Plan, { journal: boolean; magazine: boolean; premium: boolean }> = {
  gratuit:  { journal: false, magazine: false, premium: false },
  mensuel:  { journal: true,  magazine: true,  premium: true  },
  annuel:   { journal: true,  magazine: true,  premium: true  },
};

export function canAccess(plan: Plan, resource: "journal" | "magazine" | "premium"): boolean {
  return PLAN_RIGHTS[plan]?.[resource] ?? false;
}

export function isSubscriptionExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
}

export function daysUntilExpiry(expiresAt?: number): number | null {
  if (!expiresAt) return null;
  const ms = expiresAt - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function parseAccessCookie(value: string): AccessUser | null {
  try {
    const data = JSON.parse(value);

    // Format JWT login WordPress: { authToken, user: { name, email, roles } }
    if (data.user?.email) {
      return {
        name: data.user.name || data.user.email,
        email: data.user.email,
        roles: Array.isArray(data.user.roles) ? data.user.roles : [],
        plan: data.user.roles?.includes("administrator") ? "annuel" : "mensuel",
      };
    }

    // Format MyCoolPay: { email, plan, ref, expiresAt }
    if (data.email && data.plan) {
      const plan = (data.plan as Plan) in PLAN_RIGHTS ? (data.plan as Plan) : "gratuit";
      const isExpired = isSubscriptionExpired(data.expiresAt);
      return {
        name: data.name || data.email.split("@")[0],
        email: data.email,
        roles: ["subscriber"],
        plan: isExpired ? "gratuit" : plan,
        ref: data.ref,
        expiresAt: data.expiresAt,
        isExpired,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function buildAccessCookie(
  email: string,
  plan: Plan,
  ref: string,
  name?: string
): string {
  const days = PLAN_DURATION_DAYS[plan];
  const expiresAt = days > 0 ? Date.now() + days * 24 * 60 * 60 * 1000 : 0;
  return JSON.stringify({ email, plan, ref, expiresAt, name: name || email.split("@")[0] });
}
