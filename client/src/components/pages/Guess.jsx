import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { memoriesApi, guessesApi } from "../../services/api.js";
import { useAuth } from "../../context/useAuth.jsx";
import { useToast } from "../../context/ToastProvider.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";
import ConfirmModal from "../ConfirmModal.jsx";
import Spinner from "../Spinner.jsx";

export default function Guess() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [memory, setMemory] = useState(null);
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) { navigate("/dashboard"); return; }

    memoriesApi.getOne(id)
      .then((data) => { setMemory(data.memory); })
      .catch(() => {
        addToast("Memory not found", "error");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, addToast]);

  const handleSubmit = async () => {
    if (!guess.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await guessesApi.submit(id, guess);
      setSubmitted(true);
      addToast("Guess submitted! Waiting for partner's response", "success");
    } catch (err) {
      setError(err.message || "Something went wrong");
      addToast(err.message || "Guess failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (decision) => {
    setDecisionLoading(true);
    try {
      const res = await guessesApi.decide(id, decision);
      setResult(res);
      if (res.accepted) {
        addToast(`Accepted! +${res.pointsEarned} points`, "success");
        setMemory((prev) => ({ ...prev, isGuessed: true, guess: { ...prev.guess, status: "ACCEPTED" } }));
      } else {
        addToast("Guess rejected. Partner can try again!", "info");
      }
    } catch (err) {
      addToast(err.message || "Decision failed", "error");
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await memoriesApi.delete(id);
      addToast("Memory deleted", "info");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Delete failed");
      addToast(err.message || "Delete failed", "error");
    }
  };

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><Spinner size="40px" /></div>;
  }

  if (!memory) return null;

  const isOwner = memory.uploadedById === user?.id;
  const guessStatus = memory.guess?.status;

  return (
    <div style={{ padding: "32px 20px 110px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "430px", margin: "0 auto" }}>

      <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "14px", opacity: 0.9 }}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 700, color: "white" }}>
            {isOwner ? <><i className="bi bi-heart" /> Your Memory</> : <><i className="bi bi-heart" /> Guess this</>}
          </h1>
        </div>
        {isOwner && (
          <button onClick={() => setShowDeleteModal(true)} style={{ background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.3)", borderRadius: "12px", padding: "8px 14px", cursor: "pointer", color: "#fda4af", fontSize: "12px", fontWeight: 600 }}>
            <i className="bi bi-trash" />
          </button>
        )}
      </div>

      <div className="glass fade-up-2" style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginBottom: "16px" }}>
        <ImageWithFallback src={memory.imageUrl} alt="memory" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
      </div>

      <div style={{ width: "100%", display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <span className="badge badge-pink">{memory.difficulty}</span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", alignSelf: "center" }}>
          {new Date(memory.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      {isOwner && memory.secretMessage && (
        <div className="glass fade-up-3" style={{ width: "100%", borderRadius: "20px", padding: "18px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "8px" }}>
            <i className="bi bi-heart" /> Your secret message
          </p>
          <p style={{ color: "white", fontSize: "15px", lineHeight: 1.6 }}>{memory.secretMessage}</p>
        </div>
      )}

      {memory.guess && (
        <div className="glass fade-up-3" style={{ width: "100%", borderRadius: "20px", padding: "18px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "8px" }}>
            {isOwner ? <><i className="bi bi-chat-heart" /> Partner's guess</> : <><i className="bi bi-star" /> Your guess</>}
          </p>
          <p style={{ color: "white", fontSize: "15px", lineHeight: 1.6 }}>{memory.guess.guessText}</p>
          
          {guessStatus === "PENDING" && isOwner && (
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className="btn-primary" onClick={() => handleDecision("ACCEPT")} disabled={decisionLoading} style={{ flex: 1, fontSize: "14px", padding: "12px", background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <i className="bi bi-check-lg" /> Accept
              </button>
              <button className="btn-ghost" onClick={() => handleDecision("REJECT")} disabled={decisionLoading} style={{ flex: 1, fontSize: "14px", padding: "12px", borderColor: "rgba(251,113,133,0.5)", color: "#fda4af" }}>
                <i className="bi bi-arrow-repeat" /> Try Again
              </button>
            </div>
          )}
          
          {guessStatus === "ACCEPTED" && (
            <p style={{ marginTop: "10px", fontSize: "16px", color: "#6ee7b7", fontWeight: 600 }}>
              <i className="bi bi-check-circle-fill" /> Accepted! +{memory.guess.pointsEarned} points
            </p>
          )}
          
          {guessStatus === "REJECTED" && (
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#fda4af" }}>
              <i className="bi bi-x-circle" /> Rejected. Try again!
            </p>
          )}
        </div>
      )}

      {submitted && !memory.guess && (
        <div className="glass fade-up" style={{ width: "100%", borderRadius: "24px", padding: "32px 24px", textAlign: "center" }}>
          <i className="bi bi-send-check" style={{ fontSize: "48px", display: "block", marginBottom: "12px", color: "#10b981" }} />
          <p style={{ fontSize: "16px", color: "white", marginBottom: "8px" }}>Guess submitted!</p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>Waiting for {memory.uploadedBy?.nickname}'s response</p>
          <button className="btn-ghost" style={{ marginTop: "16px" }} onClick={() => navigate("/dashboard")}>
            <i className="bi bi-house" /> Back to home
          </button>
        </div>
      )}

      {result && (
        <div className="glass fade-up" style={{ width: "100%", borderRadius: "24px", padding: "32px 24px", textAlign: "center" }}>
          <i className={`bi ${result.accepted ? "bi-trophy" : "bi-arrow-repeat"}`} style={{ fontSize: "48px", display: "block", marginBottom: "12px", color: result.accepted ? "#fbbf24" : "#ec4899" }} />
          <p style={{ fontSize: "16px", color: "white", marginBottom: "8px" }}>{result.message}</p>
          {result.accepted && result.pointsEarned > 0 && (
            <p style={{ fontSize: "28px", fontWeight: 700, color: "white", margin: "12px 0" }}>+{result.pointsEarned} points</p>
          )}
          <button className="btn-ghost" style={{ marginTop: "16px" }} onClick={() => navigate("/dashboard")}>
            <i className="bi bi-house" /> Back to home
          </button>
        </div>
      )}

      {!isOwner && !memory.guess && !submitted && (
        <>
          <div className="fade-up-3" style={{ width: "100%", marginBottom: "16px" }}>
            <label className="input-label">What do you think this memory is?</label>
            <textarea className="input-field" style={{ minHeight: "120px" }} placeholder="Describe what you see, what you feel, what you remember…" value={guess} onChange={(e) => setGuess(e.target.value)} />
          </div>

          {error && <div style={{ width: "100%", marginBottom: "16px", background: "rgba(251,113,133,0.2)", border: "1px solid rgba(251,113,133,0.4)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", color: "#fda4af", textAlign: "center" }}>{error}</div>}

          <button className="btn-primary fade-up-4" onClick={handleSubmit} disabled={!guess.trim() || submitting} style={{ opacity: !guess.trim() ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px" }}>
            {submitting ? <Spinner size="18px" /> : <i className="bi bi-send" />}
            {submitting ? "Sending…" : "Share my Guess"}
          </button>
        </>
      )}

      <ConfirmModal open={showDeleteModal} title="Delete Memory?" message="This will permanently remove this memory and its image. This action cannot be undone." confirmText="Delete" cancelText="Cancel" danger onConfirm={() => { setShowDeleteModal(false); handleDelete(); }} onCancel={() => setShowDeleteModal(false)} />
    </div>
  );
}