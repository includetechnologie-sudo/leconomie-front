// IndexNow : prévient Bing (et donc ChatGPT), Yandex, Seznam… dès qu'une page est publiée ou modifiée.
// La clé est publique par conception : elle est servie à la racine du site (public/<clé>.txt).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
export const INDEXNOW_KEY = "ab18a927687081ee5cb7b0b6464b5542";

export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  if (urls.length === 0) return { ok: true, status: 0 };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
