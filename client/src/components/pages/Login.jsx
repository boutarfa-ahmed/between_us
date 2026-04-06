import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.jsx";
import { authApi } from "../../services/api.js";
import FloatingHearts from "../FloatingHearts";
import Spinner from "../Spinner.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("join");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    if (mode === "join" && (!nickname || !code)) { setError("Nickname and invite code required"); return; }

    setLoading(true);
    try {
      let data;
      if (mode === "join") {
        data = await authApi.register(email, password, nickname, code);
      } else {
        data = await authApi.login(email, password);
      }
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, #f9a8d4 0%, #c084fc 35%, #a78bfa 65%, #818cf8 100%)",
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <FloatingHearts />
      <div className="glass fade-up" style={{ width: "100%", maxWidth: "380px", borderRadius: "28px", padding: "32px 24px", position: "relative", zIndex: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="glow" style={{ display: "inline-block", borderRadius: "50%", padding: "12px", marginBottom: "8px" }}>
            <i className="bi bi-heart heartbeat" style={{ fontSize: "48px", color: "#ec4899" }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 700, color: "white", marginBottom: "6px", textShadow: "0 2px 20px rgba(168,85,247,0.5)" }}>
            {mode === "join" ? "Join Our Story" : "Welcome Back"}
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
            {mode === "join" ? "Create your couple's space" : "Your story continues"}
          </p>
        </div>

        <div className="glass-dark fade-up-2" style={{ display: "flex", borderRadius: "18px", padding: "4px", marginBottom: "20px" }}>
          {["join", "signin"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, borderRadius: "14px", padding: "10px", border: "none", cursor: "pointer",
              background: mode === m ? "rgba(255,255,255,0.25)" : "transparent",
              color: "white", fontFamily: "'Lato', sans-serif",
              fontSize: "13px", fontWeight: mode === m ? 600 : 400, transition: "all 0.3s ease",
              boxShadow: mode === m ? "0 4px 15px rgba(236,72,153,0.3)" : "none",
            }}>
              {m === "join" ? <><i className="bi bi-heart-plus" /> Join</> : <><i className="bi bi-shield-lock" /> Sign In</>}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="fade-up-2">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="fade-up-3">
            <label className="input-label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {mode === "join" && (
            <>
              <div className="fade-up-4">
                <label className="input-label">Nickname</label>
                <input className="input-field" placeholder="Moon, Star, Rose…" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              </div>
              <div className="fade-up-5">
                <label className="input-label"><i className="bi bi-heart" /> Invitation Code</label>
                <input className="input-field" placeholder="e.g. MOON-STAR-2024" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <p style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                  Create any code — share it with your partner
                </p>
              </div>
            </>
          )}

          {error && (
            <div style={{
              background: "rgba(251,113,133,0.2)", border: "1px solid rgba(251,113,133,0.4)",
              borderRadius: "14px", padding: "12px 16px",
              fontSize: "14px", color: "#fda4af", textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary fade-up-5" onClick={handleSubmit} disabled={loading} style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px" }}>
            {loading ? <Spinner size="18px" /> : <i className="bi bi-arrow-right-circle" />}
            {loading ? "Please wait…" : mode === "join" ? "Enter Our Space" : "Continue"}
          </button>
        </div>

        <p className="fade-up-5" style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
          <i className="bi bi-lock" /> This space is sacred. Only the two of you.
        </p>
      </div>
    </div>
  );
}