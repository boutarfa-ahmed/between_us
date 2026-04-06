import { useEffect, useState, useMemo } from "react";

const ICONS = ["bi-heart-fill", "bi-heart", "bi-stars", "bi-star-fill", "bi-moon-stars-fill", "bi-sun", "bi-cloud-moon", "bi-gem"];

function FloatingParticle({ style, icon }) {
  return (
    <div style={{ position: "absolute", pointerEvents: "none", fontSize: style.fontSize, color: style.color, opacity: style.opacity, left: style.left, animation: `floatUp ${style.duration}s ease-in-out infinite`, animationDelay: `${style.delay}s`, filter: "blur(0.5px)", textShadow: "0 0 10px rgba(255,255,255,0.3)", ...style }}>
      <i className={`bi ${icon}`} />
    </div>
  );
}

function FloatingStar({ style }) {
  return (
    <div style={{ position: "absolute", pointerEvents: "none", width: style.size, height: style.size, background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)", borderRadius: "50%", left: style.left, opacity: style.opacity, animation: `sparkle ${style.duration}s ease-in-out infinite`, animationDelay: `${style.delay}s`, boxShadow: "0 0 6px rgba(255,255,255,0.5)", ...style }} />
  );
}

export default function FloatingHearts() {
  const [dimensions, setDimensions] = useState({ width: 430, height: 800 });

  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      fontSize: `${14 + Math.random() * 24}px`,
      opacity: 0.1 + Math.random() * 0.25,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      color: i % 2 === 0 ? "#ec4899" : "#a855f7",
      top: `${Math.random() * 100}%`,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 4}px`,
      opacity: 0.2 + Math.random() * 0.5,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((star) => <FloatingStar key={star.id} style={star} />)}
      {particles.map((p) => <FloatingParticle key={p.id} style={p} icon={p.icon} />)}
    </div>
  );
}