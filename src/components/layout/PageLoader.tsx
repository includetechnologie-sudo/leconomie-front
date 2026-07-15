"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after 2.2s, then remove from DOM at 2.8s
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const hideTimer = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes loader-zoom-fade {
          0%   { opacity: 0; transform: scale(0.7); }
          30%  { opacity: 1; transform: scale(1.05); }
          60%  { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes loader-ring {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loader-screen-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .loader-screen {
          animation: ${fading ? "loader-screen-fade 0.6s ease forwards" : "none"};
        }
        .loader-logo {
          animation: loader-zoom-fade 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .loader-ring {
          animation: loader-ring 1s linear infinite;
        }
      `}</style>

      <div
        className="loader-screen"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
        }}
      >
        {/* Logo animé */}
        <div className="loader-logo">
          <Image
            src="/images/logo.png"
            alt="L'Economie"
            width={200}
            height={80}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Anneau tournant rouge */}
        <div
          className="loader-ring"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid #f3f4f6",
            borderTopColor: "#dc2626",
          }}
        />
      </div>
    </>
  );
}
