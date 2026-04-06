import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.jsx";
import { userApi, memoriesApi } from "../../services/api.js";
import { useToast } from "../../context/ToastProvider.jsx";
import Spinner from "../Spinner.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate         = useNavigate();
  const { user } = useAuth();
  const { addToast }     = useToast();

  const [stats, setStats]       = useState(null);
  const [recentMemory, setRecent] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, memoriesRes] = await Promise.all([
          userApi.getProfile(),
          memoriesApi.getAll(),
        ]);
        setStats(profileRes.user);
        setRecent(memoriesRes.memories?.[0] || null);
      } catch (err) {
        addToast("Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const handleLogout = () => {
    localStorage.removeItem("between_us_token");
    addToast("Signed out", "info");
    window.location.href = "/login";
  };

  const nickname = stats?.nickname || user?.nickname || "Moon";

  const statCards = [
    { label: "Weekly Points", value: stats ? `${stats.weeklyPoints}` : "…", icon: "bi-star" },
    { label: "Day Streak",    value: stats ? `${stats.streakDays}`  : "…", icon: "bi-lightning" },
    { label: "Memories",      value: stats ? `${stats.memoriesCount}`: "…", icon: "bi-heart" },
  ];

  return (
    <div style={{ padding: "32px 20px 110px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "430px", margin: "0 auto" }}>

      <div className="fade-up" style={{ textAlign: "center", marginBottom: "28px", width: "100%" }}>
        <div className="glow" style={{ display: "inline-block", borderRadius: "50%", padding: "10px", marginBottom: "8px" }}>
          <i className="bi bi-moon-stars heartbeat" style={{ fontSize: "48px", color: "#c084fc" }} />
        </div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "6px" }}>
          {getGreeting()}
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "44px", fontWeight: 700, color: "white", lineHeight: 1.1, textShadow: "0 4px 20px rgba(168,85,247,0.4)" }}>
          {nickname}
        </h1>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner size="40px" />
        </div>
      ) : (
        <>
          <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", width: "100%", marginBottom: "20px" }}>
            {statCards.map((s) => (
              <div key={s.label} className="glass card" style={{ padding: "18px 10px", textAlign: "center", borderRadius: "20px" }}>
                <i className={`${s.icon}`} style={{ fontSize: "24px", display: "block", marginBottom: "6px", color: "#ec4899" }} />
                <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{s.value}</p>
                <p style={{ marginTop: "4px", fontSize: "9px", color: "rgba(255,255,255,0.8)", letterSpacing: "0.5px", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="fade-up-3" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginBottom: "24px" }}>
            <button className="btn-primary" onClick={() => navigate("/upload")} style={{ fontSize: "16px", padding: "16px" }}>
              <i className="bi bi-camera" /> Share a Memory
            </button>
            <button className="btn-ghost" onClick={() => navigate("/guess")} style={{ fontSize: "15px" }}>
              <i className="bi bi-heart" /> Guess Partner's Memory
            </button>
          </div>

          <div className="fade-up-4" style={{ width: "100%" }}>
            <p style={{ marginBottom: "12px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
              <i className="bi bi-star" /> Latest Memory
            </p>

            {recentMemory ? (
              <div className="glass card" onClick={() => navigate(`/guess/${recentMemory.id}`)} style={{ borderRadius: "24px", overflow: "hidden", cursor: "pointer" }}>
                <ImageWithFallback src={recentMemory.imageUrl} alt="recent memory" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                <div style={{ padding: "18px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600, color: "white", marginBottom: "10px" }}>
                    {recentMemory.secretMessage || "Memory"}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="badge badge-pink">{recentMemory.difficulty}</span>
                    {recentMemory.guess && <span className="badge badge-purple">+{recentMemory.guess.pointsEarned} pts <i className="bi bi-star-fill" /></span>}
                    {recentMemory.isGuessed && <span className="badge badge-green"><i className="bi bi-check-lg" /></span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass" style={{ borderRadius: "24px", padding: "40px", textAlign: "center" }}>
                <i className="bi bi-cloud-heart" style={{ fontSize: "48px", display: "block", marginBottom: "12px", color: "#a855f7" }} />
                <p style={{ color: "white", fontSize: "16px", fontFamily: "'Cormorant Garamond', serif", marginBottom: "8px" }}>No memories yet</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Be the first to share a moment!</p>
              </div>
            )}
          </div>
        </>
      )}

      <button onClick={handleLogout} style={{ marginTop: "32px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "13px", textDecoration: "underline" }}>
        Sign out
      </button>
    </div>
  );
}