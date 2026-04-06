import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../../services/api.js";
import Spinner from "../Spinner.jsx";

export default function Timeline() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await memoriesApi.getAll(selectedYear);
        const list = data.memories || [];
        setMemories(list);

        const uniqueYears = [...new Set(list.map((m) => new Date(m.createdAt).getFullYear()))].sort((a, b) => b - a);
        setYears(uniqueYears);
      } catch (err) {
        console.error("Timeline fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [selectedYear]);

  const grouped = memories.reduce((acc, memory) => {
    const date = new Date(memory.createdAt);
    const monthKey = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(memory);
    return acc;
  }, {});

  return (
    <div style={{ padding: "32px 20px 110px", maxWidth: "430px", margin: "0 auto" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 700, color: "white" }}>
          <i className="bi bi-clock-history" /> Timeline
        </h1>
        <span className="badge badge-purple" style={{ fontSize: "12px", padding: "6px 14px" }}>
          {memories.length} memories
        </span>
      </div>

      {years.length > 1 && (
        <div className="fade-up-2" style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          <button className={`btn-sm ${!selectedYear ? "active" : ""}`} onClick={() => setSelectedYear(null)}><i className="bi bi-layers" /> All</button>
          {years.map((y) => (
            <button key={y} className={`btn-sm ${selectedYear === y ? "active" : ""}`} onClick={() => setSelectedYear(y)}>{y}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size="40px" /></div>
      ) : memories.length === 0 ? (
        <div className="glass fade-up-2" style={{ borderRadius: "24px", padding: "48px 24px", textAlign: "center" }}>
          <i className="bi bi-moon-stars" style={{ fontSize: "48px", display: "block", marginBottom: "16px", color: "#c084fc" }} />
          <p style={{ color: "white", fontSize: "18px", fontFamily: "'Cormorant Garamond', serif", marginBottom: "8px" }}>No memories yet</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "20px" }}>Start sharing your moments together</p>
          <button className="btn-primary" style={{ maxWidth: "200px", margin: "0 auto" }} onClick={() => navigate("/upload")}>
            <i className="bi bi-camera" /> Share a Memory
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {Object.entries(grouped).map(([month, monthMemories], idx) => (
            <div key={month} className={`fade-up-${Math.min(idx + 2, 5)}`}>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "12px" }}>
                <i className="bi bi-star" /> {month}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {monthMemories.map((memory) => {
                  const date = new Date(memory.createdAt);
                  const day = date.getDate();
                  return (
                    <div key={memory.id} className="glass card" onClick={() => navigate(`/guess/${memory.id}`)} style={{ borderRadius: "20px", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "stretch" }}>
                      <div style={{ width: "72px", minWidth: "72px", background: "linear-gradient(135deg, rgba(236,72,153,0.5), rgba(168,85,247,0.5))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "24px", fontWeight: 700, color: "white", lineHeight: 1 }}>{day}</span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", marginTop: "4px" }}>{date.toLocaleDateString("en-GB", { month: "short" })}</span>
                      </div>
                      <div style={{ flex: 1, padding: "14px" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, color: "white", marginBottom: "8px" }}>{memory.secretMessage || "Memory"}</p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <span className="badge badge-pink">{memory.difficulty}</span>
                          {memory.guess && <span className="badge badge-purple">+{memory.guess.pointsEarned} pts <i className="bi bi-star-fill" /></span>}
                          {memory.isGuessed && <span className="badge badge-green"><i className="bi bi-check-lg" /></span>}
                          {memory.songUrl && <span className="badge badge-pink"><i className="bi bi-music-note" /></span>}
                        </div>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>by {memory.uploadedBy?.nickname || "Unknown"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}