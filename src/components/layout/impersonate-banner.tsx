"use client";

import { useSession } from "@/lib/auth/session-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, ArrowLeft, Loader2 } from "lucide-react";

export function ImpersonateBanner() {
  const { user, impersonating, refresh } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!impersonating || !user) return null;

  async function handleStopImpersonating() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stop-impersonate", { method: "POST" });
      if (res.ok) {
        await refresh();
        router.push("/admin/usuarios");
        router.refresh();
      }
    } catch {
      // If it fails, redirect to login
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-violet-600 px-4 py-1.5 text-white text-[13px] font-medium">
      <Eye className="size-3.5 shrink-0" />
      <span>
        Estás viendo como: <strong>{displayName}</strong> ({user.roleName})
      </span>
      <button
        onClick={handleStopImpersonating}
        disabled={loading}
        className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-white/20 px-2.5 py-0.5 text-[12px] font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <ArrowLeft className="size-3" />
        )}
        Volver a tu cuenta
      </button>
    </div>
  );
}
