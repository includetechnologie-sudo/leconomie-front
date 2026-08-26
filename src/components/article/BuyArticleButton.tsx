"use client";

import { useState } from "react";

interface Props {
  slug: string;
}

export default function BuyArticleButton({ slug }: Props) {
  const [step, setStep] = useState<"idle" | "form" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card">("mobile");
  const [error, setError] = useState("");

  async function handleBuy() {
    if (!email) {
      setError("Entrez votre adresse email.");
      return;
    }
    if (paymentMethod === "mobile" && !phone) {
      setError("Entrez votre numéro de téléphone.");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const res = await fetch("/api/achat-article/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          slug,
          phone: paymentMethod === "mobile" ? phone : undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || "Erreur lors du paiement.");
        setStep("form");
      }
    } catch {
      setError("Erreur réseau.");
      setStep("form");
    }
  }

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("form")}
        className="w-full border-2 border-[#c9a84c] bg-[#c9a84c]/10 rounded-xl px-4 py-3 hover:bg-[#c9a84c]/20 transition text-center group"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="16" height="16" fill="none" stroke="#c9a84c" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-bold text-[#c9a84c]">Acheter cet article</span>
        </div>
        <p className="text-lg font-bold text-[#c9a84c]">200 FCFA</p>
        <p className="text-[10px] text-gray-500 mt-0.5">Accès valide 48 heures</p>
      </button>
    );
  }

  return (
    <div className="w-full border-2 border-[#c9a84c] rounded-xl px-4 py-4 bg-[#c9a84c]/5">
      <p className="text-sm font-bold text-center text-[#c9a84c] mb-3">
        Acheter cet article — 200 FCFA (48h)
      </p>

      {/* Email */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse email"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/30"
      />

      {/* Méthode de paiement */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setPaymentMethod("mobile")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg border transition ${
            paymentMethod === "mobile"
              ? "bg-[#c9a84c] text-black border-[#c9a84c]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#c9a84c]"
          }`}
        >
          Mobile Money
        </button>
        <button
          onClick={() => setPaymentMethod("card")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg border transition ${
            paymentMethod === "card"
              ? "bg-[#c9a84c] text-black border-[#c9a84c]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#c9a84c]"
          }`}
        >
          Carte bancaire
        </button>
      </div>

      {paymentMethod === "mobile" && (
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="6XX XXX XXX"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/30"
        />
      )}

      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      <button
        onClick={handleBuy}
        disabled={step === "loading"}
        className="w-full bg-[#c9a84c] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#b8943f] transition disabled:opacity-60"
      >
        {step === "loading" ? "Traitement..." : "Payer 200 FCFA"}
      </button>

      <button
        onClick={() => setStep("idle")}
        className="w-full text-xs text-gray-400 mt-2 hover:text-gray-600"
      >
        Annuler
      </button>
    </div>
  );
}