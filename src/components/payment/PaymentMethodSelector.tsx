"use client";

import { useState } from "react";

export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export const MOBILE_MONEY_COUNTRIES: CountryOption[] = [
  { code: "CM", name: "Cameroun", dial: "237", flag: "🇨🇲" },
  { code: "GA", name: "Gabon", dial: "241", flag: "🇬🇦" },
  { code: "CG", name: "Congo", dial: "242", flag: "🇨🇬" },
  { code: "TD", name: "Tchad", dial: "235", flag: "🇹🇩" },
  { code: "CF", name: "Centrafrique", dial: "236", flag: "🇨🇫" },
  { code: "GQ", name: "Guinée Éq.", dial: "240", flag: "🇬🇶" },
  { code: "CI", name: "Côte d'Ivoire", dial: "225", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", dial: "221", flag: "🇸🇳" },
  { code: "BF", name: "Burkina Faso", dial: "226", flag: "🇧🇫" },
  { code: "ML", name: "Mali", dial: "223", flag: "🇲🇱" },
  { code: "BJ", name: "Bénin", dial: "229", flag: "🇧🇯" },
  { code: "TG", name: "Togo", dial: "228", flag: "🇹🇬" },
  { code: "NE", name: "Niger", dial: "227", flag: "🇳🇪" },
  { code: "GW", name: "Guinée-Bissau", dial: "245", flag: "🇬🇼" },
];

export type PaymentMethod = "mobile" | "card";

interface Props {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  country: CountryOption;
  onCountryChange: (c: CountryOption) => void;
  phone: string;
  onPhoneChange: (p: string) => void;
}

export default function PaymentMethodSelector({
  method,
  onMethodChange,
  country,
  onCountryChange,
  phone,
  onPhoneChange,
}: Props) {
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Onglets méthode */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onMethodChange("mobile")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition ${
            method === "mobile"
              ? "border-red-600 bg-red-50 text-red-600"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          Mobile Money
        </button>
        <button
          type="button"
          onClick={() => onMethodChange("card")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition ${
            method === "card"
              ? "border-red-600 bg-red-50 text-red-600"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Carte Visa/MC
        </button>
      </div>

      {/* Champ téléphone avec sélecteur pays (Mobile Money uniquement) */}
      {method === "mobile" && (
        <div className="relative">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200">
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-sm hover:bg-gray-100 transition shrink-0"
            >
              <span className="text-base">{country.flag}</span>
              <span className="text-gray-600 font-medium">+{country.dial}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
              placeholder="6XX XX XX XX"
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none min-w-0"
            />
          </div>

          {/* Dropdown pays */}
          {countryOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {MOBILE_MONEY_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCountryChange(c); setCountryOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 transition text-left ${
                    c.code === country.code ? "bg-red-50 text-red-600 font-medium" : "text-gray-700"
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-gray-400 text-xs">+{c.dial}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info carte */}
      {method === "card" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-semibold mb-0.5">Paiement par carte bancaire</p>
          <p>Vous serez redirigé vers la page sécurisée MyCoolPay pour saisir vos informations de carte Visa ou Mastercard.</p>
        </div>
      )}
    </div>
  );
}
