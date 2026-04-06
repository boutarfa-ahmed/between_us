// layouts/MainLayout.jsx
// Wraps all authenticated pages: gradient bg + floating hearts + navbar
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import FloatingHearts from "../components/FloatingHearts";

export default function MainLayout() {
  return (
    <div
      className="page-wrapper"
      style={{
        background: "linear-gradient(145deg, #f9a8d4 0%, #c084fc 35%, #a78bfa 65%, #818cf8 100%)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FloatingHearts />

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh" }}>
        <Outlet />
      </div>

      <Navbar />
    </div>
  );
}