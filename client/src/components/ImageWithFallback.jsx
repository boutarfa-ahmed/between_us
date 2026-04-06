import { useState } from "react";

export default function ImageWithFallback({ src, alt, style, className }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: "140px", background: "linear-gradient(135deg, rgba(236,72,153,0.35), rgba(168,85,247,0.35))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", ...style }}>
        <i className="bi bi-moon-stars" style={{ color: "rgba(255,255,255,0.6)" }} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} onError={() => setError(true)} />;
}