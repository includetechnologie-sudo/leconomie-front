"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.4);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderPage = useCallback(async (pageNum: number, sc: number) => {
    if (!pdfRef.current || !canvasRef.current) return;
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { /* ok */ }
    }
    const page = await pdfRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale: sc });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch {
      // annulé — normal lors d'un changement de page rapide
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const pdf = await pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: true,
        }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setStatus("ready");
        await renderPage(1, scale);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  useEffect(() => {
    if (status === "ready") renderPage(currentPage, scale);
  }, [currentPage, scale, status, renderPage]);

  function goTo(page: number) {
    const p = Math.max(1, Math.min(page, numPages));
    setCurrentPage(p);
  }

  return (
    <div
      className="flex flex-col bg-gray-900"
      style={{ minHeight: "calc(100vh - 56px)" }}
      // Désactive le clic droit sur tout le composant
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Barre de contrôles */}
      {status === "ready" && (
        <div
          className="flex items-center justify-center gap-3 bg-gray-800 border-b border-gray-700 px-4 py-2 flex-wrap select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-white transition"
            title="Page précédente"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <span className="text-white text-sm font-medium tabular-nums">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-white transition"
            title="Page suivante"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-600" />

          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1)))}
            className="p-1.5 rounded hover:bg-gray-700 text-white transition"
            title="Zoom arrière"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <span className="text-gray-400 text-xs w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>

          <button
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="p-1.5 rounded hover:bg-gray-700 text-white transition"
            title="Zoom avant"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </div>
      )}

      {/* Zone d'affichage */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center py-6 px-4"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Spinner chargement */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "3px solid #374151",
                borderTopColor: "#dc2626",
                animation: "spin 1s linear infinite",
              }}
            />
            <p className="text-gray-400 text-sm">Chargement du journal…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Erreur */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 px-4 text-center">
            <svg width="48" height="48" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="15"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <p className="text-white font-bold">PDF non disponible</p>
            <p className="text-gray-400 text-sm max-w-sm">
              Ce fichier n&apos;est pas encore en ligne. Revenez dans quelques instants ou contactez-nous.
            </p>
            <a
              href="https://wa.me/237693537690"
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#1ebe5a] transition"
            >
              Contacter le support
            </a>
          </div>
        )}

        {/* Canvas PDF — rendu image, non téléchargeable */}
        {status === "ready" && (
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded"
            style={{ maxWidth: "100%", display: "block", pointerEvents: "none" }}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  );
}
