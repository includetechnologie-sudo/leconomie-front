"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PushNotifButton = dynamic(
  () => import("@/components/notifications/PushNotifButton"),
  { ssr: false }
);

type Variant = "footer" | "sidebar" | "banner" | "article-bar";

export default function NewsletterForm({ variant = "footer" }: { variant?: Variant }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Inscription confirmée ! Vérifiez votre boîte email.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Réessayez.");
    }
  }

  if (variant === "article-bar") {
    return (
      <div className="my-8 bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-bold text-sm text-gray-900">Recevez notre briefing économique</p>
          <p className="text-xs text-gray-500">Tous les jours avant 10h dans votre boîte mail</p>
        </div>
        {status === "success" ? (
          <p className="text-sm font-semibold text-green-600 flex-1 text-center">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "…" : "S'inscrire"}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-xs text-red-500">{message}</p>}
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="bg-red-600 text-white rounded-xl p-5">
        <h3 className="font-bold text-base mb-1">Newsletter</h3>
        <p className="text-xs opacity-90 mb-3">Recevez l&apos;actualité économique chaque matin.</p>
        {status === "success" ? (
          <p className="text-sm font-semibold bg-white/20 rounded-lg p-3">{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded text-gray-900 text-sm mb-2 focus:outline-none"
            />
            {status === "error" && <p className="text-xs text-white/80 mb-2">{message}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-black text-white py-2 rounded text-sm font-bold hover:bg-gray-900 transition disabled:opacity-60"
            >
              {status === "loading" ? "Inscription…" : "S'inscrire"}
            </button>
          </form>
        )}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs opacity-75 mb-2">Notifications en temps réel</p>
          <PushNotifButton />
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className="bg-gradient-to-r from-red-700 to-red-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Restez informé chaque matin</h2>
          <p className="text-white/80 mb-6 text-sm">Recevez l&apos;essentiel de l&apos;actualité économique de la zone CEMAC directement dans votre boîte email.</p>
          {status === "success" ? (
            <div className="bg-white/20 rounded-xl p-4 inline-block">
              <p className="font-semibold">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-black text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-900 transition disabled:opacity-60 whitespace-nowrap"
              >
                {status === "loading" ? "…" : "S'inscrire gratuitement"}
              </button>
            </form>
          )}
          {status === "error" && <p className="text-white/70 text-xs mt-2">{message}</p>}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-white/60 text-xs">Et aussi :</span>
            <PushNotifButton />
          </div>
        </div>
      </section>
    );
  }

  // Footer (défaut)
  return (
    <div>
      {status === "success" ? (
        <p className="text-sm text-green-400 font-semibold">{message}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-red-500"
            />
            {status === "error" && <p className="text-red-400 text-xs">{message}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-red-600 text-white text-sm font-bold py-2 rounded hover:bg-red-700 transition disabled:opacity-60"
            >
              {status === "loading" ? "Inscription…" : "S'inscrire"}
            </button>
          </form>
          <div className="mt-1">
            <PushNotifButton />
          </div>
        </div>
      )}
    </div>
  );
}
