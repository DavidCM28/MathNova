import { useState } from "react";
import type { ToastState } from "../types";

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (text: string, error = false) => {
    setToast({ text, error });
    window.clearTimeout(Number(sessionStorage.getItem("mnxToastTimer") || 0));
    const timer = window.setTimeout(() => setToast(null), 2200);
    sessionStorage.setItem("mnxToastTimer", String(timer));
  };

  return { toast, showToast };
}
