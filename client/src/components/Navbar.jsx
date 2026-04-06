import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/dashboard", icon: "bi-house", label: "Home" },
  { path: "/upload",    icon: "bi-camera", label: "Memory" },
  { path: "/guess",     icon: "bi-heart", label: "Guess" },
  { path: "/timeline",  icon: "bi-clock", label: "Timeline" },
  { path: "/profile",   icon: "bi-person", label: "Profile" },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="glass"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: "390px",
        borderRadius: "24px",
        padding: "10px 8px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      }}
    >
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const active = pathname === path || (path === "/guess" && pathname.startsWith("/guess/"));
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: active ? "rgba(236, 72, 153, 0.25)" : "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
              borderRadius: "16px",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              transform: active ? "scale(1.08)" : "scale(1)",
              boxShadow: active ? "0 0 20px rgba(236, 72, 153, 0.4)" : "none",
            }}
          >
            <i 
              className={`bi ${icon}`}
              style={{ 
                fontSize: "22px", 
                color: active ? "#ec4899" : "rgba(255,255,255,0.6)",
                filter: active ? "drop-shadow(0 0 6px rgba(236,72,153,0.8))" : "none",
                transition: "all 0.3s ease",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: active ? 600 : 400,
                color: active ? "#ec4899" : "rgba(255,255,255,0.5)",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}