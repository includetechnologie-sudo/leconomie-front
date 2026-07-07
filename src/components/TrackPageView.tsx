"use client";

import { useEffect } from "react";

export default function TrackPageView({ slug }: { slug?: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug || null }),
    }).catch(() => {});
  }, [slug]);

  return null;
}
