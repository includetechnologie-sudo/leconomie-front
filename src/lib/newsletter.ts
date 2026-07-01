import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

export interface NewsletterSubscriber {
  email: string;
  token: string;
  createdAt: number;
}

export async function readSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    // Migration : ancien format = tableau de strings
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
      return (data as string[]).map((email) => ({
        email,
        token: crypto.createHash("sha256").update(email + "leconomie").digest("hex").slice(0, 32),
        createdAt: Date.now(),
      }));
    }
    return data as NewsletterSubscriber[];
  } catch {
    return [];
  }
}

export async function writeSubscribers(list: NewsletterSubscriber[]) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(list, null, 2));
}

export function generateToken(email: string): string {
  return crypto.randomBytes(24).toString("hex");
}

export function buildUnsubscribeUrl(email: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
