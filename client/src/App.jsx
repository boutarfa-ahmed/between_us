// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import { useAuth } from "./context/useAuth";
import { usePushNotifications } from "./hooks/usePushNotifications";

import Login        from "./components/pages/Login";
import Dashboard    from "./components/pages/Dashboard";
import UploadMemory from "./components/pages/UploadMemory";
import Guess        from "./components/pages/Guess";
import GuessList    from "./components/pages/GuessList";
import Timeline     from "./components/pages/Timeline";
import Profile      from "./components/pages/Profile";

// Layout
import MainLayout from "./layouts/MainLayout";

// Landing page (inline – simple enough)
import FloatingHearts from "./components/FloatingHearts";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #f9a8d4 0%, #c084fc 35%, #a78bfa 65%, #818cf8 100%)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <FloatingHearts />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "340px" }}>
        <div className="glow" style={{ display: "inline-block", borderRadius: "50%", padding: "20px", marginBottom: "8px" }}>
          <i
            className="bi bi-heart-heart heartbeat"
            style={{ fontSize: "56px", color: "#ec4899", filter: "drop-shadow(0 0 30px rgba(236,72,153,0.8))" }}
          />
        </div>
        <h1
          className="fade-up"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-2px",
            lineHeight: 1,
            textShadow: "0 4px 30px rgba(168, 85, 247, 0.5), 0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          Between Us
        </h1>
        <div className="fade-up-2 bob-rotate" style={{ margin: "16px 0", color: "rgba(252,231,243,0.9)", fontSize: "20px", letterSpacing: "8px" }}>
          <i className="bi bi-heart-fill" /> <i className="bi bi-heart-fill" /> <i className="bi bi-heart-fill" />
        </div>
        <p
          className="fade-up-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "24px",
            fontWeight: 500,
            color: "white",
            marginBottom: "12px",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          A private space just for us.
        </p>
        <p
          className="fade-up-4"
          style={{
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.85)",
            marginBottom: "40px",
          }}
        >
          Share your most precious memories, emotions, and moments together.
          <br />A beautiful journey of connection, no matter the distance.
        </p>
        <button
          className="btn-primary fade-up-5"
          onClick={() => navigate("/login")}
          style={{ maxWidth: "260px", margin: "0 auto" }}
        >
          <i className="bi bi-arrow-right-circle" /> Enter Our Space
        </button>
      </div>
    </div>
  );
}

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  usePushNotifications();
  
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div style={{ maxWidth: "430px", margin: "0 auto" }}>
            <Routes>
              <Route path="/"      element={<Landing />} />
              <Route path="/login" element={<Login />}   />

              <Route
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />}    />
                <Route path="/upload"    element={<UploadMemory />} />
                <Route path="/guess"     element={<GuessList />}    />
                <Route path="/guess/:id" element={<Guess />}        />
                <Route path="/timeline"  element={<Timeline />}     />
                <Route path="/profile"   element={<Profile />}      />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}