export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", danger = true }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        className="glass"
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: "24px",
          padding: "28px 24px",
          maxWidth: "320px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "white",
            marginBottom: "8px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(249,168,212,0.85)",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-ghost"
            onClick={onCancel}
            style={{ fontSize: "13px", padding: "11px 16px" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              borderRadius: "18px",
              padding: "11px 16px",
              fontSize: "13px",
              fontWeight: 600,
              color: "white",
              border: "none",
              cursor: "pointer",
              background: danger
                ? "linear-gradient(135deg, #fb7185, #e11d48)"
                : "linear-gradient(135deg, #ec4899, #a855f7)",
              transition: "all 0.25s ease",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
