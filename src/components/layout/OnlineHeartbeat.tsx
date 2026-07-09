"use client";

import { useEffect, useRef } from "react";

export default function OnlineHeartbeat() {
  const uidRef = useRef<string>("");

  useEffect(() => {
    uidRef.current = sessionStorage.getItem("visitor_uid") || Math.random().toString(36).slice(2);
    sessionStorage.setItem("visitor_uid", uidRef.current);

    const beat = () =>
      fetch("/api/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uidRef.current }),
      }).catch(() => {});

    beat();
    const iv = setInterval(beat, 20000);
    return () => clearInterval(iv);
  }, []);

  return null;
}
