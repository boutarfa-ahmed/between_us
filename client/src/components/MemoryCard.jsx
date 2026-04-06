export default function MemoryCard({ memory, onClick, compact = false }) {
  const { emoji = "bi-stars", title = "Untitled memory", imageUrl, date = "", difficulty = "Medium", points = 0, guessed = false, songAttached = false } = memory;

  return (
    <div className="glass card" onClick={onClick} style={{ overflow: "hidden", cursor: onClick ? "pointer" : "default", borderRadius: "22px", position: "relative" }}>
      {!compact && imageUrl ? (
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={imageUrl} alt={title} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} onMouseOver={(e) => e.target.style.transform = "scale(1.05)"} onMouseOut={(e) => e.target.style.transform = "scale(1)"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
        </div>
      ) : !compact ? (
        <div style={{ height: "140px", background: "linear-gradient(135deg, rgba(236,72,153,0.4), rgba(168,85,247,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "rgba(255,255,255,0.8)" }}>
          <i className={`bi ${emoji}`} />
        </div>
      ) : (
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <i className={`bi ${emoji}`} style={{ fontSize: "28px", color: "#ec4899" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 600, color: "white", flex: 1 }}>{title}</p>
        </div>
      )}

      {!compact && (
        <div style={{ padding: "16px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 600, color: "white", marginBottom: "4px" }}>{title}</p>
          {date && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>{date}</p>}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="badge badge-pink">{difficulty}</span>
            {points > 0 && <span className="badge badge-purple">+{points} pts <i className="bi bi-star-fill" /></span>}
            {guessed && <span className="badge badge-green"><i className="bi bi-check-lg" /></span>}
            {songAttached && <span className="badge badge-pink"><i className="bi bi-music-note" /></span>}
          </div>
        </div>
      )}
    </div>
  );
}