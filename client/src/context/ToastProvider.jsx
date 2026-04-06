import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

const ICONS = {
  success: "bi-check-circle-fill",
  error: "bi-exclamation-circle-fill",
  info: "bi-info-circle-fill",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 10000, display: "flex", flexDirection: "column", gap: "10px", width: "calc(100% - 48px)", maxWidth: "380px", pointerEvents: "none" }}>
        {toasts.map((toast) => {
          const colors = {
            success: { bg: "rgba(52, 211, 153, 0.25)", border: "rgba(52, 211, 153, 0.5)", text: "#6ee7b7", shadow: "rgba(52, 211, 153, 0.3)" },
            error: { bg: "rgba(251, 113, 133, 0.25)", border: "rgba(251, 113, 133, 0.5)", text: "#fda4af", shadow: "rgba(251, 113, 133, 0.3)" },
            info: { bg: "rgba(168, 85, 247, 0.25)", border: "rgba(168, 85, 247, 0.5)", text: "#c4b5fd", shadow: "rgba(168, 85, 247, 0.3)" },
          };
          const c = colors[toast.type] || colors.success;
          return (
            <div key={toast.id} onClick={() => removeToast(toast.id)} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "16px", padding: "14px 18px", fontSize: "14px", color: c.text, textAlign: "center", cursor: "pointer", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: `0 8px 32px ${c.shadow}, 0 2px 8px rgba(0,0,0,0.1)`, animation: "toastIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", pointerEvents: "auto" }}>
              <i className={`bi ${ICONS[toast.type]}`} style={{ fontSize: "16px" }} />
              {toast.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}