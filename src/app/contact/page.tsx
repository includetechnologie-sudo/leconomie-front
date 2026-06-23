"use client";

import React, { useState } from "react";

const WA_NUMBER = "237693537690";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

const DEPARTMENTS = [
  {
    role: "Direction",
    email: "contact@leconomie.info",
    phones: ["(+237) 693 53 76 90", "(+237) 672 55 69 44"],
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    role: "Service Commercial",
    email: "delphinembia@leconomie.info",
    phones: ["(+237) 693 53 76 90", "(+237) 672 55 69 44"],
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
  },
  {
    role: "La Rédaction",
    email: "redaction@leconomie.info",
    phones: ["(+237) 693 53 76 90", "(+237) 672 55 69 44"],
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    role: "Publicité & Partenariats",
    email: "contact@leconomie.info",
    phones: ["(+237) 693 53 76 90", "(+237) 672 55 69 44"],
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    const text = `*Nouveau message depuis leconomie.info*\n\n*Nom :* ${nom}\n*Email :* ${email}\n*Sujet :* ${sujet}\n\n*Message :*\n${message}`;
    window.open(`${WA_BASE}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="bg-gradient-to-br from-gray-100 to-red-50 py-16 px-4 text-center"
      >
        <span className="inline-block bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded mb-4 uppercase tracking-widest">
          Contactez-nous
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Nous sommes à votre écoute
        </h1>
        <p className="text-gray-700 max-w-xl mx-auto text-lg">
          Pour toute question, suggestion ou demande d&apos;information, n&apos;hésitez pas à nous joindre par le moyen qui vous convient le mieux.
        </p>
      </div>

      {/* Infos rapides */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <a
            href="https://maps.google.com/?q=CONGENI+MVOG-ADA+Yaounde"
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition group"
          >
            <div className="bg-red-100 text-red-600 rounded-full p-3 group-hover:bg-red-600 group-hover:text-white transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 mb-1">Localisation</p>
              <p className="text-xs text-gray-500 leading-relaxed">CONGENI MVOG-ADA<br/>face Boulangerie The BEST, Yaoundé</p>
            </div>
          </a>

          <a
            href={`mailto:contact@leconomie.info`}
            className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition group"
          >
            <div className="bg-red-100 text-red-600 rounded-full p-3 group-hover:bg-red-600 group-hover:text-white transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 mb-1">Adresse email</p>
              <p className="text-xs text-gray-500">contact@leconomie.info</p>
            </div>
          </a>

          <a
            href={WA_BASE}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition group"
          >
            <div className="bg-red-100 text-red-600 rounded-full p-3 group-hover:bg-red-600 group-hover:text-white transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 mb-1">Téléphone</p>
              <p className="text-xs text-gray-500">(+237) 693 53 76 90<br/>(+237) 672 55 69 44</p>
            </div>
          </a>

        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">

        {/* Départements */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 inline-block rounded" />
            Nos services
          </h2>

          <div className="space-y-4">
            {DEPARTMENTS.map((d) => (
              <div key={d.role} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-600 text-white rounded-lg p-2">{d.icon}</div>
                  <h3 className="font-bold text-gray-900">{d.role}</h3>
                </div>
                <div className="space-y-1.5 pl-1">
                  <a
                    href={`mailto:${d.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {d.email}
                  </a>
                  {d.phones.map((p) => (
                    <a
                      key={p}
                      href={`https://wa.me/${p.replace(/\D/g, "").replace(/^237/, "237")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
                    >
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Réseaux sociaux */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Suivez-nous</h3>
            <div className="flex gap-3">
              {[
                { label: "Facebook", href: "https://www.facebook.com/leconomiecmr", color: "#1877F2", icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
                { label: "X", href: "https://x.com/leconomie_quo", color: "#000", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
                { label: "YouTube", href: "https://www.youtube.com/@LEconomieTV", color: "#FF0000", icon: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></> },
                { label: "WhatsApp", href: `https://wa.me/${WA_NUMBER}`, color: "#25D366", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/> },
                { label: "LinkedIn", href: "https://linkedin.com", color: "#0A66C2", icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  style={{ backgroundColor: s.color }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-80 transition"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire → WhatsApp */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 inline-block rounded" />
            Envoyez-nous un message
          </h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Prénom et nom"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
              <select
                required
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="">Choisissez un sujet</option>
                <option value="Abonnement">Abonnement</option>
                <option value="Publicité & Partenariat">Publicité & Partenariat</option>
                <option value="Rédaction / Information">Rédaction / Information</option>
                <option value="Service commercial">Service commercial</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Votre message *</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre demande..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#25D366] text-white font-bold py-3 rounded-lg hover:bg-[#1ebe5a] transition flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Envoyer via WhatsApp
            </button>

            <p className="text-xs text-gray-400 text-center">
              Votre message sera envoyé directement sur WhatsApp — réponse rapide garantie.
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
