"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        message: `Dashboard error: ${error.message}`,
        stack: error.stack,
        context: { digest: error.digest, path: window.location.pathname },
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
        <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-lg font-semibold">Error en esta seccion</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Algo falló al cargar esta pagina. El equipo fue notificado automaticamente.
      </p>
      {error.message && (
        <p className="text-xs text-muted-foreground/60 bg-muted/50 rounded-lg px-3 py-2 max-w-lg text-center font-mono">
          {error.message}
        </p>
      )}
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reintentar
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          Inicio
        </a>
      </div>
    </div>
  );
}
