import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../../services/api.js";
import { useAuth } from "../../context/useAuth.jsx";
import Spinner from "../Spinner.jsx";

export default function GuessList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await memoriesApi.getAll();
        const list = (data.memories || []).filter(m => m.uploadedById !== user?.id && !m.isGuessed);
        setMemories(list);
      } catch (err) {
        console.error("GuessList fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [user]);

  return (
    <div style={{ padding: "32px 20px 110px", maxWidth: "430px", margin: "0 auto" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 700, color: "white" }}>
          <i className="bi bi-heart" /> Guess
        </h1>
        <span className="badge badge-purple" style={{ fontSize: "12px", padding: "6px 14px" }}>
          {memories.length} to guess
        </span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size="40px" /></div>
      ) : memories.length === 0 ? (
        <div className="glass fade-up-2" style={{ borderRadius: "24px", padding: "48px 24px", textAlign: "center" }}>
          <i className="bi bi-heart-break" style={{ fontSize: "48px", display: "block", marginBottom: "16px", color: "#a855f7" }} />
          <p style={{ color: "white", fontSize: "18px", fontFamily: "'Cormorant Garamond', serif", marginBottom: "8px" }}>All caught up!</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>No new memories to guess right now</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {memories.map((memory, idx) => (
            <div key={memory.id} className={`glass card fade-up-${Math.min(idx + 2, 5)}`} onClick={() => navigate(`/guess/${memory.id}`)} style={{ borderRadius: "20px", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "stretch" }}>
              <div style={{ width: "80px", minWidth: "80px", background: "linear-gradient(135deg, rgba(236,72,153,0.5), rgba(168,85,247,0.5))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <i className="bi bi-question-lg" style={{ fontSize: "28px", color: "white" }} />
              </div>
              <div style={{ flex: 1, padding: "16px" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 600, color: "white", marginBottom: "8px" }}>{memory.secretMessage || "Mystery memory"}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <span className="badge badge-pink">{memory.difficulty}</span>
                  {memory.songUrl && <span className="badge badge-purple"><i className="bi bi-music-note" /></span>}
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>by {memory.uploadedBy?.nickname || "Unknown"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}