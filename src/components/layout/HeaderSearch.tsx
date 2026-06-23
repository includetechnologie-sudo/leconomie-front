"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/recherche?q=${encodeURIComponent(value.trim())}`);
    setOpen(false);
    setValue("");
  }

  return (
    <div className="relative">
      {open ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => { if (!value) setOpen(false); }}
            placeholder="Rechercher…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:border-red-500 transition"
          />
          <button type="submit" className="text-red-600 hover:text-red-700 transition" aria-label="Lancer la recherche">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button type="button" onClick={() => { setOpen(false); setValue(""); }}
            className="text-gray-400 hover:text-gray-600 transition" aria-label="Fermer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-gray-500 hover:text-red-600 transition p-1"
          aria-label="Rechercher"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
      )}
    </div>
  );
}
