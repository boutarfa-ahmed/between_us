import { useState } from "react";

export default function ImageWithFallback({ src, alt, style, className }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ 
        width: "100%", 
        minHeight: "280px", 
        maxHeight: "400px",
        background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: "64px", 
        ...style 
      }}>
        <i className="bi bi-image" style={{ color: "rgba(255,255,255,0.5)" }} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} onError={() => setError(true)} />;
}