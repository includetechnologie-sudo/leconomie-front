"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  from: "bot" | "user";
  text: string;
  options?: string[];
}

const WHATSAPP_NUMBER = "237650817454";

const INITIAL_MESSAGE: Message = {
  from: "bot",
  text: "Bonjour ! 👋 Je suis l'assistant de L'Économie. Comment puis-je vous aider ?",
  options: [
    "Problème de paiement",
    "Article qui ne charge pas",
    "Problème de connexion",
    "Journal non accessible",
    "Autre problème",
  ],
};

const RESPONSES: Record<string, Message> = {
  "Problème de paiement": {
    from: "bot",
    text: "Je comprends. Pouvez-vous préciser votre souci de paiement ?",
    options: [
      "Le paiement a échoué",
      "J'ai payé mais pas d'accès",
      "Je ne trouve pas mon moyen de paiement",
      "Parler au support",
    ],
  },
  "Le paiement a échoué": {
    from: "bot",
    text: "Vérifiez que votre solde est suffisant et que vous avez entré le bon numéro. Réessayez dans quelques minutes. Si le problème persiste, je vous redirige vers le support.",
    options: ["Problème résolu ✓", "Parler au support"],
  },
  "J'ai payé mais pas d'accès": {
    from: "bot",
    text: "Il arrive que l'activation prenne quelques minutes. Déconnectez-vous puis reconnectez-vous. Si le problème persiste après 10 min :",
    options: ["Problème résolu ✓", "Parler au support"],
  },
  "Je ne trouve pas mon moyen de paiement": {
    from: "bot",
    text: "Nous acceptons Mobile Money (Orange, MTN, Moov) et les cartes Visa/Mastercard. Choisissez l'onglet correspondant lors du paiement.",
    options: ["Problème résolu ✓", "Parler au support"],
  },
  "Article qui ne charge pas": {
    from: "bot",
    text: "Essayez ces étapes :\n1. Rafraîchissez la page\n2. Videz le cache du navigateur\n3. Vérifiez votre connexion internet",
    options: ["Problème résolu ✓", "Ça ne fonctionne toujours pas"],
  },
  "Ça ne fonctionne toujours pas": {
    from: "bot",
    text: "Je vais vous rediriger vers notre support technique qui pourra vous assister directement.",
    options: ["Parler au support"],
  },
  "Problème de connexion": {
    from: "bot",
    text: "Quelques solutions :\n• Vérifiez votre email (pas d'espace)\n• Utilisez \"Mot de passe oublié\" pour le réinitialiser\n• Videz les cookies du navigateur",
    options: ["Problème résolu ✓", "Parler au support"],
  },
  "Journal non accessible": {
    from: "bot",
    text: "Le journal est réservé aux abonnés et acheteurs. Vérifiez que :\n• Vous êtes connecté à votre compte\n• Votre abonnement est actif\n• Vous avez acheté ce numéro",
    options: ["Problème résolu ✓", "Voir les abonnements", "Parler au support"],
  },
  "Autre problème": {
    from: "bot",
    text: "Pouvez-vous décrire votre problème ? En attendant, je peux vous mettre en contact avec le support technique.",
    options: ["Parler au support"],
  },
  "Voir les abonnements": {
    from: "bot",
    text: "Je vous redirige vers la page abonnements.",
    options: [],
  },
};

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [showButton, setShowButton] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastScrollY.current && currentY > 200;
        if (scrollingDown && !isOpen) {
          setShowButton(false);
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = setTimeout(() => setShowButton(true), 2000);
        }
        lastScrollY.current = currentY;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleOption(option: string) {
    setMessages((prev) => [...prev, { from: "user", text: option }]);

    if (option === "Parler au support") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Je vous redirige vers notre support technique sur WhatsApp. Un conseiller vous répondra rapidement.",
            options: [],
          },
        ]);
        setTimeout(() => {
          window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide avec le site leconomie.info")}`,
            "_blank"
          );
        }, 1500);
      }, 600);
      return;
    }

    if (option === "Voir les abonnements") {
      setTimeout(() => {
        window.location.href = "/abonnement";
      }, 800);
      return;
    }

    if (option === "Problème résolu ✓") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Parfait ! N'hésitez pas à revenir si vous avez d'autres questions. Bonne lecture ! 📰",
            options: ["Nouvelle question"],
          },
        ]);
      }, 600);
      return;
    }

    if (option === "Nouvelle question") {
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    const response = RESPONSES[option];
    if (response) {
      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
      }, 600);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Je ne suis pas sûr de comprendre. Voulez-vous que je vous mette en contact avec le support ?",
            options: ["Parler au support", "Nouvelle question"],
          },
        ]);
      }, 600);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setTimeout(() => setMessages([INITIAL_MESSAGE]), 300);
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          showButton && !isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
        aria-label="Support"
      >
        <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-full sm:h-[520px] sm:max-h-[80vh] sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white flex flex-col`}
        >
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm leading-tight">Support L&apos;Économie</p>
              <p className="text-xs text-green-100">En ligne • Répond instantanément</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
              aria-label="Fermer"
            >
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Options cliquables */}
            {messages.length > 0 && messages[messages.length - 1].options && messages[messages.length - 1].options!.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {messages[messages.length - 1].options!.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="bg-white border border-green-200 text-green-700 text-sm px-3 py-1.5 rounded-full hover:bg-green-50 hover:border-green-400 transition shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-100 px-4 py-2.5 text-center shrink-0">
            <p className="text-xs text-gray-400">
              Propulsé par L&apos;Économie • <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">WhatsApp direct</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
