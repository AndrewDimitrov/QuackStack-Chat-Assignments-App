"use client";

import { useEffect, useRef } from "react";

export default function MessageContextMenu({
  x,
  y,
  onEdit,
  onDelete,
  canEdit,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 9999,
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        padding: "4px",
        minWidth: "140px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      {canEdit && (
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            border: "none",
            background: "transparent",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--color-text-primary)",
            width: "100%",
            textAlign: "left",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--color-bg-secondary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      )}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          border: "none",
          background: "transparent",
          borderRadius: "7px",
          cursor: "pointer",
          fontSize: "13px",
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--color-error)",
          width: "100%",
          textAlign: "left",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-error-bg)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
        Delete
      </button>
    </div>
  );
}
