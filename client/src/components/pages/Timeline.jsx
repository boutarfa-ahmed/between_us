import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../../services/api.js";
import { useAuth } from "../../context/useAuth.jsx";
import Spinner from "../Spinner.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";

export default function Timeline() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await memoriesApi.getAll(selectedYear);
        let list = data.memories || [];
        
        // Filter out rejected guesses for non-owners
        list = list.filter(m => {
          if (m.guess && m.guess.status === "REJECTED" && m.guess.userId !== user?.id) {
            return false;
          }
          return true;
        });
        
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
  }, [selectedYear, user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ padding: "32px 20px 110px", maxWidth: "430px", margin: "0 auto" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 700, color: "white" }}>
          <i className="bi bi-images" /> Gallery
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
          <i className="bi bi-images" style={{ fontSize: "48px", display: "block", marginBottom: "16px", color: "#c084fc" }} />
          <p style={{ color: "white", fontSize: "18px", fontFamily: "'Cormorant Garamond', serif", marginBottom: "8px" }}>No memories yet</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "20px" }}>Start sharing your moments together</p>
          <button className="btn-primary" style={{ maxWidth: "200px", margin: "0 auto" }} onClick={() => navigate("/upload")}>
            <i className="bi bi-camera" /> Share a Memory
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {memories.map((memory, idx) => {
            const isExpanded = expandedId === memory.id;
            const isOwner = memory.uploadedById === user?.id;
            const isRejected = memory.guess?.status === "REJECTED";
            
            return (
              <div 
                key={memory.id} 
                className={`glass card fade-up-${Math.min(idx + 2, 5)}`}
                onClick={() => toggleExpand(memory.id)}
                style={{ 
                  borderRadius: "16px", 
                  overflow: "hidden", 
                  cursor: "pointer",
                  gridColumn: isExpanded ? "span 2" : "auto",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ position: "relative" }}>
                  <ImageWithFallback 
                    src={memory.imageUrl} 
                    alt="memory" 
                    style={{ 
                      width: "100%", 
                      height: isExpanded ? "300px" : "150px", 
                      objectFit: "cover", 
                      display: "block" 
                    }} 
                  />
                  
                  {/* Overlay with info */}
                  <div style={{ 
                    position: "absolute", 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    padding: isExpanded ? "40px 12px 12px" : "8px",
                    background: isExpanded ? "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" : "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                    transition: "all 0.3s ease"
                  }}>
                    {!isExpanded && (
                      <p style={{ 
                        fontSize: "11px", 
                        color: "white", 
                        fontWeight: 600,
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                      }}>
                        {memory.secretMessage || "Tap to reveal"}
                      </p>
                    )}
                  </div>
                  
                  {/* Status badges */}
                  <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px" }}>
                    {memory.isGuessed && (
                      <span className="badge badge-green"><i className="bi bi-check-lg" /></span>
                    )}
                    {isRejected && !isOwner && (
                      <span className="badge" style={{ background: "rgba(251,113,133,0.6)", color: "white" }}><i className="bi bi-x-lg" /></span>
                    )}
                    {memory.songUrl && (
                      <span className="badge badge-pink"><i className="bi bi-music-note" /></span>
                    )}
                  </div>
                </div>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span className="badge badge-pink">{memory.difficulty}</span>
                      {memory.guess && memory.guess.status === "ACCEPTED" && (
                        <span className="badge badge-purple">+{memory.guess.pointsEarned} pts</span>
                      )}
                    </div>
                    
                    <p style={{ color: "white", fontSize: "14px", marginBottom: "8px", fontFamily: "'Cormorant Garamond', serif" }}>
                      {memory.secretMessage || "No message"}
                    </p>
                    
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}>
                      by {memory.uploadedBy?.nickname} · {new Date(memory.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    
                    <button 
                      className="btn-ghost" 
                      style={{ fontSize: "12px", padding: "8px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/guess/${memory.id}`);
                      }}
                    >
                      <i className="bi bi-arrow-right" /> View Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}