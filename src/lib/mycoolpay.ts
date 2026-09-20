// Solde marchand en temps réel via l'API MyCoolPay (GET /api/{public_key}/balance, header X-PRIVATE-KEY)
export async function fetchMyCoolPayBalance(): Promise<number | null> {
  const publicKey = process.env.MYCOOLPAY_PUBLIC_KEY;
  const privateKey = process.env.MYCOOLPAY_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;

  try {
    const res = await fetch(`https://my-coolpay.com/api/${publicKey}/balance`, {
      method: "GET",
      headers: { "X-PRIVATE-KEY": privateKey, "Accept": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.balance === "number" ? data.balance : null;
  } catch {
    return null;
  }
}
