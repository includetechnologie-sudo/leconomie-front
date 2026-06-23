"use client";

import { useEffect } from "react";

export default function RightClickProtection() {
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      // Bloquer F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    const blockSelect = (e: Event) => e.preventDefault();

    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKey);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("dragstart", blockSelect);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKey);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("dragstart", blockSelect);
    };
  }, []);

  return null;
}
