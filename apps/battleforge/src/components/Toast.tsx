"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 10000,
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  const colors = {
    info: { bg: "#1e3a5f", border: "#0ea5e9", icon: "i" },
    success: { bg: "#14532d", border: "#22c55e", icon: "✓" },
    warning: { bg: "#713f12", border: "#f59e0b", icon: "!" },
    error: { bg: "#7f1d1d", border: "#ef4444", icon: "✕" },
  };

  const { bg, border, icon } = colors[toast.type];

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        padding: "12px 16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        animation: "slideIn 0.3s ease",
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Icon */}
      <span
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: border,
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#fff",
            marginBottom: toast.message ? "4px" : 0,
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onDismiss(toast.id);
            }}
            style={{
              marginTop: "8px",
              padding: "4px 12px",
              backgroundColor: border,
              border: "none",
              borderRadius: "4px",
              color: "#000",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.6)",
          cursor: "pointer",
          padding: "4px",
          fontSize: "16px",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
