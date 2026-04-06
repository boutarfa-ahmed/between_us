import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../../services/api.js";
import { useToast } from "../../context/ToastProvider.jsx";
import Spinner from "../Spinner.jsx";

const DIFFICULTIES = [
  { key: "EASY",   label: "Easy",   icon: "bi-emoji-smile" },
  { key: "MEDIUM", label: "Medium", icon: "bi-emoji-expressionless" },
  { key: "HARD",   label: "Hard",   icon: "bi-emoji-sunglasses" },
];

export default function UploadMemory() {
  const navigate     = useNavigate();
  const fileInputRef = useRef();
  const { addToast } = useToast();

  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [difficulty, setDiff]   = useState("MEDIUM");
  const [message, setMessage]   = useState("");
  const [song, setSong]        = useState("");
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");
  const [done, setDone]        = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!file) { setError("Please choose an image"); return; }
    setError("");
    setLoading(true);
    try {
      await memoriesApi.upload(file, difficulty, message, song);
      setDone(true);
      addToast("Memory shared with your partner", "success");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Upload failed");
      addToast(err.message || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 20px 110px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "430px", margin: "0 auto" }}>

      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "14px", opacity: 0.9 }}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 700, color: "white" }}>
          New Memory <i className="bi bi-heart" />
        </h1>
      </div>

      <div
        className="fade-up-2 glass"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          width: "100%", minHeight: "200px", borderRadius: "24px",
          border: `3px dashed ${dragging ? "rgba(236,72,153,0.9)" : "rgba(255,255,255,0.3)"}`,
          background: dragging ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.1)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", marginBottom: "20px", overflow: "hidden", transition: "all 0.3s ease",
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
        ) : (
          <>
            <i className="bi bi-camera" style={{ fontSize: "48px", marginBottom: "12px", color: "#ec4899" }} />
            <p style={{ color: "white", fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>Drop your memory here</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>or click to choose a photo</p>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <div className="fade-up-3" style={{ width: "100%", marginBottom: "16px" }}>
        <label className="input-label">Difficulty Level</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {DIFFICULTIES.map(({ key, label, icon }) => (
            <button key={key} className={`btn-sm ${difficulty === key ? "active" : ""}`} onClick={() => setDiff(key)} style={{ flex: 1 }}>
              <i className={icon} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="fade-up-4" style={{ width: "100%", marginBottom: "16px" }}>
        <label className="input-label"><i className="bi bi-heart" /> Secret Message</label>
        <textarea className="input-field" placeholder="Write something only they would know…" value={message} onChange={(e) => setMessage(e.target.value)} style={{ minHeight: "100px" }} />
      </div>

      <div className="fade-up-5" style={{ width: "100%", marginBottom: "24px" }}>
        <label className="input-label"><i className="bi bi-music-note-beamed" /> Attach a Song (optional)</label>
        <input className="input-field" placeholder="Paste Spotify / Apple Music link…" value={song} onChange={(e) => setSong(e.target.value)} />
      </div>

      {error && (
        <div className="glass" style={{ width: "100%", marginBottom: "16px", borderRadius: "16px", padding: "14px 18px", background: "rgba(251,113,133,0.2)", border: "1px solid rgba(251,113,133,0.4)", fontSize: "14px", color: "#fda4af", textAlign: "center" }}>
          {error}
        </div>
      )}

      <button className="btn-primary fade-up-5" onClick={handleSubmit} disabled={!file || loading || done} style={{ opacity: (!file || loading) ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "16px", padding: "16px" }}>
        {loading ? <Spinner size="18px" /> : <i className="bi bi-send" />}
        {done ? "Memory shared" : loading ? "Uploading…" : "Share this Memory"}
      </button>
    </div>
  );
}