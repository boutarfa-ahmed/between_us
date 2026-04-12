import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.jsx";
import { userApi } from "../../services/api.js";
import { useToast } from "../../context/ToastProvider.jsx";
import { subscribeToPush, unsubscribeFromPush } from "../../services/notifications.js";
import Spinner from "../Spinner.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [partner, setPartner] = useState(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      await unsubscribeFromPush();
      setNotificationsEnabled(false);
      addToast("Notifications disabled", "info");
    } else {
      const sub = await subscribeToPush();
      if (sub) {
        setNotificationsEnabled(true);
        addToast("Notifications enabled! 🔔", "success");
      } else {
        addToast("Enable notifications in browser settings", "error");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, partnerRes] = await Promise.all([
          userApi.getProfile(),
          userApi.getPartner(),
        ]);
        setProfile(profileRes.user);
        setNickname(profileRes.user.nickname);
        if (partnerRes.partner) setPartner(partnerRes.partner);
      } catch (err) {
        addToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const handleSave = async () => {
    if (nickname.trim().length < 2) { addToast("Nickname too short", "error"); return; }
    setSaving(true);
    try {
      const res = await userApi.updateNickname(nickname.trim());
      setProfile((prev) => ({ ...prev, nickname: res.user.nickname }));
      setEditing(false);
      addToast("Nickname updated", "success");
    } catch (err) {
      addToast(err.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><Spinner size="40px" /></div>;
  }

  return (
    <div style={{ padding: "32px 20px 110px", maxWidth: "430px", margin: "0 auto" }}>

      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "14px", opacity: 0.9 }}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 700, color: "white" }}>
          <i className="bi bi-person-heart" /> Profile
        </h1>
      </div>

      <div className="glass fade-up-2" style={{ borderRadius: "24px", padding: "28px 24px", marginBottom: "20px", textAlign: "center" }}>
        <div className="glow" style={{ display: "inline-block", borderRadius: "50%", padding: "12px", marginBottom: "8px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 700, color: "white", boxShadow: "0 8px 32px rgba(236, 72, 153, 0.4)" }}>
            {profile?.nickname?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>

        {editing ? (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center", margin: "16px 0" }}>
            <input className="input-field" value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ maxWidth: "160px", padding: "10px 14px" }} autoFocus />
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: "10px 16px", fontSize: "12px", width: "auto" }}>
              {saving ? "…" : <><i className="bi bi-check-lg" /> Save</>}
            </button>
            <button onClick={() => { setEditing(false); setNickname(profile?.nickname); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "16px" }}><i className="bi bi-x-lg" /></button>
          </div>
        ) : (
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 700, color: "white", marginBottom: "8px" }}>{profile?.nickname || "Unknown"}</h2>
        )}

        {!editing && (
          <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>
            <i className="bi bi-pencil" /> Edit nickname
          </button>
        )}

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "12px" }}>{profile?.email || ""}</p>
      </div>

      <div className="fade-up-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
        <div className="glass" style={{ borderRadius: "20px", padding: "16px 10px", textAlign: "center" }}>
          <i className="bi bi-star" style={{ fontSize: "22px", display: "block", marginBottom: "4px", color: "#ec4899" }} />
          <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{profile?.totalPoints || 0}</p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", marginTop: "4px", textTransform: "uppercase" }}>Total Points</p>
        </div>
        <div className="glass" style={{ borderRadius: "20px", padding: "16px 10px", textAlign: "center" }}>
          <i className="bi bi-lightning" style={{ fontSize: "22px", display: "block", marginBottom: "4px", color: "#f59e0b" }} />
          <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{profile?.streakDays || 0}</p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", marginTop: "4px", textTransform: "uppercase" }}>Day Streak</p>
        </div>
        <div className="glass" style={{ borderRadius: "20px", padding: "16px 10px", textAlign: "center" }}>
          <i className="bi bi-heart" style={{ fontSize: "22px", display: "block", marginBottom: "4px", color: "#ec4899" }} />
          <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{profile?.memoriesCount || 0}</p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", marginTop: "4px", textTransform: "uppercase" }}>Memories</p>
        </div>
      </div>

      {partner ? (
        <div className="glass fade-up-4" style={{ borderRadius: "24px", padding: "20px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "16px" }}>
            <i className="bi bi-heart-fill" /> Your Partner
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: "white", boxShadow: "0 4px 20px rgba(168, 85, 247, 0.4)" }}>
              {partner.nickname?.charAt(0).toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 600, color: "white" }}>{partner.nickname}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}><i className="bi bi-star" /> {partner.totalPoints || 0} points · <i className="bi bi-lightning" /> {partner.streakDays || 0}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass fade-up-4" style={{ borderRadius: "24px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
          <i className="bi bi-heart-plus" style={{ fontSize: "32px", display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.6)" }} />
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Your partner hasn't joined yet</p>
        </div>
      )}

      <button onClick={toggleNotifications} style={{ width: "100%", borderRadius: "18px", padding: "14px", fontSize: "14px", fontWeight: 600, color: notificationsEnabled ? "#4ade80" : "#fbbf24", background: notificationsEnabled ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)", border: `1px solid ${notificationsEnabled ? "rgba(74,222,128,0.3)" : "rgba(251,191,36,0.3)"}`, cursor: "pointer", marginBottom: "12px", transition: "all 0.3s ease" }}>
        <i className={`bi ${notificationsEnabled ? "bi-bell-fill" : "bi-bell"}`} /> {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
      </button>

      <button onClick={() => { logout(); addToast("Signed out", "info"); navigate("/login"); }} style={{ width: "100%", borderRadius: "18px", padding: "14px", fontSize: "14px", fontWeight: 600, color: "#fda4af", background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.3)", cursor: "pointer", transition: "all 0.3s ease" }}>
        <i className="bi bi-box-arrow-right" /> Sign Out
      </button>
    </div>
  );
}