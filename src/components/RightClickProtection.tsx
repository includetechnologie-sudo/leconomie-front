"use client";

import { useEffect } from "react";

export default function RightClickProtection() {
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    const blockSelect = (e: Event) => e.preventDefault();
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "");
      }
    };

    const blockTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.closest("img")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKey);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("dragstart", blockSelect);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("touchstart", blockTouch, { passive: false });

    const style = document.createElement("style");
    style.id = "content-protection";
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKey);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("dragstart", blockSelect);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("touchstart", blockTouch);
      const s = document.getElementById("content-protection");
      if (s) s.remove();
    };
  }, []);

  return null;
}
